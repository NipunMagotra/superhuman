import { NextResponse } from 'next/server';
import {
  getGmailEmailDetail,
  parseGmailMessage,
  archiveGmailEmail,
  modifyGmailEmailLabels,
  trashGmailEmail,
  replyToGmailEmail,
} from '@/lib/gmail';

// GET: Retrieve a single email from Gmail
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fullMsg = await getGmailEmailDetail(id);
    return NextResponse.json(parseGmailMessage(fullMsg));
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
    const { action, value } = body;

    if (action === 'archive') {
      await archiveGmailEmail(id);
    } else if (action === 'star') {
      if (value) {
        await modifyGmailEmailLabels(id, ['STARRED'], []);
      } else {
        await modifyGmailEmailLabels(id, [], ['STARRED']);
      }
    } else if (action === 'read') {
      if (value) {
        await modifyGmailEmailLabels(id, [], ['UNREAD']);
      } else {
        await modifyGmailEmailLabels(id, ['UNREAD'], []);
      }
    } else {
      return NextResponse.json({ error: 'Invalid PATCH action' }, { status: 400 });
    }

    const fullMsg = await getGmailEmailDetail(id);
    return NextResponse.json({ success: true, email: parseGmailMessage(fullMsg) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Move email to trash
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await trashGmailEmail(id);
    return NextResponse.json({ success: true });
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
