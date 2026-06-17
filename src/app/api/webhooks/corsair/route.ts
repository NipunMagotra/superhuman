import { NextResponse } from 'next/server';
import { corsair } from '@/lib/corsair';
import { processWebhook } from 'corsair';


export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    
    // Parse headers
    const headers: Record<string, string | string[] | undefined> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const url = new URL(request.url);
    const query: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      query[key] = value;
    });

    // Process webhook via Corsair
    const result = await processWebhook(corsair, headers, rawBody, query);

    if (result.plugin === 'gmail') {
      console.log('Received Gmail webhook notification:', result.action);
      
      // If it's a new email or change, we can trigger a sync of latest emails
      // to keep our cache fresh immediately.
      // We run this asynchronously so webhook responds fast
      if (result.body && typeof result.body === 'object') {
        // Gmail push notifications usually send historyId or message details
        // We can schedule a cache sync or run a quick sync here
        const syncUrl = new URL('/api/emails/sync', request.url).toString();
        fetch(syncUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }).catch(err => console.error('Failed to trigger background sync from webhook:', err));
      }
    } else if (result.plugin === 'googlecalendar') {
      console.log('Received Google Calendar webhook notification:', result.action);
      const syncUrl = new URL('/api/calendar', request.url).toString();
      fetch(syncUrl).catch(err => console.error('Failed to trigger background calendar sync:', err));
    }

    if (result.response) {
      return new Response(JSON.stringify(result.response), {
        status: result.response.statusCode || 200,
        headers: {
          'Content-Type': 'application/json',
          ...(result.responseHeaders || {}),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error handling webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
