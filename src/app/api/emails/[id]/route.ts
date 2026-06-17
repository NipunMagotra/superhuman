import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import {
  getGmailEmailDetail,
  archiveGmailEmail,
  modifyGmailEmailLabels,
  trashGmailEmail,
  replyToGmailEmail,
} from '@/lib/gmail';

// GET: Retrieve a single email detail
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check cache first
    const { data: cached } = await supabaseServer
      .from('cached_emails')
      .select('*')
      .eq('gmail_id', id)
      .single();

    if (cached && !cached.body_html) {
      // If we have a cached version but it doesn't have the full body_html/text, fetch full detail
      const fullMsg = await getGmailEmailDetail(id);
      
      const labels = fullMsg.labelIds || [];
      const isRead = !labels.includes('UNREAD');
      const isStarred = labels.includes('STARRED');

      // Helper to parse MIME body parts
      let bodyText = '';
      let bodyHtml = '';

      const parseParts = (part: any) => {
        if (!part) return;
        if (part.mimeType === 'text/plain' && part.body?.data) {
          bodyText = Buffer.from(part.body.data, 'base64').toString('utf8');
        } else if (part.mimeType === 'text/html' && part.body?.data) {
          bodyHtml = Buffer.from(part.body.data, 'base64').toString('utf8');
        } else if (part.parts) {
          part.parts.forEach(parseParts);
        }
      };

      if (fullMsg.payload) {
        parseParts(fullMsg.payload);
      }

      // If no explicit html/text parsed, fallback to message snippet
      if (!bodyText && !bodyHtml) {
        bodyText = fullMsg.snippet || '';
      }
      if (!bodyHtml) {
        bodyHtml = `<div style="font-family: sans-serif; white-space: pre-wrap;">${bodyText}</div>`;
      }

      // Update cache
      const { data: updated, error: updateErr } = await supabaseServer
        .from('cached_emails')
        .update({
          body_text: bodyText,
          body_html: bodyHtml,
          labels,
          is_read: isRead,
          is_starred: isStarred,
        })
        .eq('gmail_id', id)
        .select()
        .single();

      if (updateErr) {
        console.error('Failed to update email cache with detail:', updateErr);
      }

      return NextResponse.json(updated || cached);
    }

    if (cached) {
      return NextResponse.json(cached);
    }

    // Not in cache, fetch from Gmail directly
    const fullMsg = await getGmailEmailDetail(id);
    return NextResponse.json(fullMsg);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH: Modify email state (Archive, Star, Read)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, value } = body; // action: 'archive' | 'star' | 'read'

    let updatedLabels: string[] | null = null;
    let isRead: boolean | null = null;
    let isStarred: boolean | null = null;

    if (action === 'archive') {
      await archiveGmailEmail(id);
      
      // Update local db
      const { data } = await supabaseServer
        .from('cached_emails')
        .select('labels')
        .eq('gmail_id', id)
        .single();
      
      if (data) {
        updatedLabels = (data.labels || []).filter((l: string) => l !== 'INBOX');
      }
    } else if (action === 'star') {
      isStarred = !!value;
      if (isStarred) {
        await modifyGmailEmailLabels(id, ['STARRED'], []);
      } else {
        await modifyGmailEmailLabels(id, [], ['STARRED']);
      }
      
      const { data } = await supabaseServer
        .from('cached_emails')
        .select('labels')
        .eq('gmail_id', id)
        .single();

      if (data) {
        updatedLabels = isStarred
          ? [...new Set([...(data.labels || []), 'STARRED'])]
          : (data.labels || []).filter((l: string) => l !== 'STARRED');
      }
    } else if (action === 'read') {
      isRead = !!value;
      if (isRead) {
        // Mark read (remove UNREAD)
        await modifyGmailEmailLabels(id, [], ['UNREAD']);
      } else {
        // Mark unread (add UNREAD)
        await modifyGmailEmailLabels(id, ['UNREAD'], []);
      }

      const { data } = await supabaseServer
        .from('cached_emails')
        .select('labels')
        .eq('gmail_id', id)
        .single();

      if (data) {
        updatedLabels = isRead
          ? (data.labels || []).filter((l: string) => l !== 'UNREAD')
          : [...new Set([...(data.labels || []), 'UNREAD'])];
      }
    } else {
      return NextResponse.json({ error: 'Invalid PATCH action' }, { status: 400 });
    }

    // Update in local DB cache
    const updateData: any = {};
    if (updatedLabels !== null) updateData.labels = updatedLabels;
    if (isRead !== null) updateData.is_read = isRead;
    if (isStarred !== null) updateData.is_starred = isStarred;

    const { data: updatedRecord, error: updateErr } = await supabaseServer
      .from('cached_emails')
      .update(updateData)
      .eq('gmail_id', id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, email: updatedRecord });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Move email to trash
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Call Gmail API trash
    await trashGmailEmail(id);

    // Update cache to reflect TRASH label
    const { data } = await supabaseServer
      .from('cached_emails')
      .select('labels')
      .eq('gmail_id', id)
      .single();

    let updatedLabels = ['TRASH'];
    if (data && data.labels) {
      updatedLabels = [...new Set([...data.labels.filter((l: string) => l !== 'INBOX'), 'TRASH'])];
    }

    const { data: updatedRecord, error: updateErr } = await supabaseServer
      .from('cached_emails')
      .update({ labels: updatedLabels })
      .eq('gmail_id', id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, email: updatedRecord });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Reply to an email (thread)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: parentMessageId } = await params;
    const body = await request.json();
    const { threadId, to, subject, bodyHtml } = body;

    if (!threadId || !to || !subject || !bodyHtml) {
      return NextResponse.json(
        { error: 'Missing required fields: threadId, to, subject, bodyHtml' },
        { status: 400 }
      );
    }

    const response = await replyToGmailEmail(
      threadId,
      parentMessageId,
      to,
      subject,
      bodyHtml
    );

    return NextResponse.json({ success: true, message: response });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

