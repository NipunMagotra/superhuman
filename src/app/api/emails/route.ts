import { NextResponse } from 'next/server';
import {
  listGmailEmails,
  sendGmailEmail,
  getGmailMessageSummary,
  labelToGmailQuery,
} from '@/lib/gmail';

// GET: List emails directly from Gmail
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const label = searchParams.get('label') || 'INBOX';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query = labelToGmailQuery(label);
    const messageList = await listGmailEmails(query, limit);

    const emails = (
      await Promise.all(
        (messageList || []).map(async (msg) => {
          if (!msg.id) return null;
          try {
            return await getGmailMessageSummary(msg.id);
          } catch {
            return null;
          }
        })
      )
    ).filter(Boolean);

    return NextResponse.json({
      emails,
      count: emails.length,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Send a new email
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, bodyHtml } = body;

    if (!to || !subject || !bodyHtml) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, bodyHtml' },
        { status: 400 }
      );
    }

    const response = await sendGmailEmail(to, subject, bodyHtml);
    return NextResponse.json({ success: true, message: response });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
