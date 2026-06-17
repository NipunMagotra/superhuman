import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { sendGmailEmail } from '@/lib/gmail';

// GET: Retrieve cached emails from Supabase
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const label = searchParams.get('label') || 'INBOX'; // e.g., 'INBOX', 'SENT', 'TRASH', 'STARRED'
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const priorityFilter = searchParams.get('priority') === 'true'; // filter priority >= 0.7

    let query = supabaseServer
      .from('cached_emails')
      .select('*', { count: 'exact' });

    // Handle filter parameters
    if (label === 'STARRED') {
      query = query.eq('is_starred', true);
    } else if (label === 'TRASH') {
      query = query.contains('labels', ['TRASH']);
    } else {
      // For general labels (e.g. INBOX, SENT), verify it is in labels array and NOT in TRASH
      query = query.contains('labels', [label]).not('labels', 'cs', '{TRASH}');
    }

    if (priorityFilter) {
      // High priority emails
      query = query.gte('priority_score', 0.7);
    }

    // Default sorting: priority_score desc, received_at desc
    query = query
      .order('priority_score', { ascending: false })
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      emails: data || [],
      count: count || 0,
      limit,
      offset,
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
