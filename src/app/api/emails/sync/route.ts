import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { listGmailEmails, getGmailEmailDetail } from '@/lib/gmail';
import { scorePriority } from '@/lib/priority';
import { cacheEmailWithEmbedding } from '@/lib/embeddings';

export async function POST() {
  try {
    // 1. Fetch latest 20 email headers/ids from Gmail via Corsair
    const messages = await listGmailEmails(undefined, 20);

    const syncResults = [];

    // Helper to parse MIME body parts
    const parseMimeBody = (part: any): { text: string; html: string } => {
      let text = '';
      let html = '';
      if (!part) return { text, html };

      if (part.mimeType === 'text/plain' && part.body?.data) {
        text = Buffer.from(part.body.data, 'base64').toString('utf8');
      } else if (part.mimeType === 'text/html' && part.body?.data) {
        html = Buffer.from(part.body.data, 'base64').toString('utf8');
      } else if (part.parts) {
        part.parts.forEach((p: any) => {
          const res = parseMimeBody(p);
          if (res.text) text += res.text + '\n';
          if (res.html) html += res.html + '\n';
        });
      }
      return { text, html };
    };

    // 2. Process each email
    for (const msgInfo of messages) {
      const gmailId = msgInfo.id;
      const threadId = msgInfo.threadId;

      if (!gmailId || !threadId) continue;

      // Check if we already have the email fully cached (with body and priority)
      const { data: existing } = await supabaseServer
        .from('cached_emails')
        .select('gmail_id, body_text, priority_score')
        .eq('gmail_id', gmailId)
        .single();

      if (existing && existing.body_text && existing.priority_score > 0) {
        // Already fully cached, skip heavy calculations
        syncResults.push({ gmail_id: gmailId, status: 'skipped (already cached)' });
        continue;
      }

      // Fetch full details from Gmail
      const detail = await getGmailEmailDetail(gmailId);
      const headers = detail.payload?.headers || [];

      // Parse headers
      const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
      const fromHeader = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
      const fromName = fromHeader.split('<')[0]?.replace(/"/g, '').trim() || fromHeader;
      const fromAddress = fromHeader.match(/<([^>]+)>/)?.[1] || fromHeader;

      // To addresses parsing
      const toHeader = headers.find((h: any) => h.name.toLowerCase() === 'to')?.value || '';
      const toAddresses = toHeader.split(',').map((t: string) => {
        const addr = t.match(/<([^>]+)>/)?.[1] || t.trim();
        const name = t.split('<')[0]?.replace(/"/g, '').trim() || '';
        return { address: addr, name: name || undefined };
      }).filter((t: any) => t.address);

      const labels = detail.labelIds || [];
      const isRead = !labels.includes('UNREAD');
      const isStarred = labels.includes('STARRED');
      
      // Get internal date
      const internalDate = detail.internalDate ? new Date(parseInt(detail.internalDate, 10)).toISOString() : new Date().toISOString();

      // Parse body text and html
      const { text: bodyText, html: bodyHtml } = parseMimeBody(detail.payload);

      const parsedText = bodyText || detail.snippet || '';
      const parsedHtml = bodyHtml || `<div style="font-family: sans-serif; white-space: pre-wrap;">${parsedText}</div>`;

      // Score priority with AI
      const priorityScore = await scorePriority({
        subject,
        from_name: fromName,
        from_address: fromAddress,
        snippet: detail.snippet || '',
      });

      // Upsert to DB with embedding generation
      await cacheEmailWithEmbedding({
        gmail_id: gmailId,
        thread_id: threadId,
        from_address: fromAddress,
        from_name: fromName,
        to_addresses: toAddresses,
        subject,
        snippet: detail.snippet || '',
        body_text: parsedText,
        body_html: parsedHtml,
        labels,
        is_read: isRead,
        is_starred: isStarred,
        priority_score: priorityScore,
        received_at: internalDate,
      });

      syncResults.push({ gmail_id: gmailId, status: 'synced', priority: priorityScore });
    }

    return NextResponse.json({ success: true, synced: syncResults });
  } catch (err: any) {
    console.error('Error in sync endpoint:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
