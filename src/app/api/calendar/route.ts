import { NextResponse } from 'next/server';
import { listCalendarEvents, createCalendarEvent } from '@/lib/calendar';
import { supabaseServer } from '@/lib/supabase';

// GET: List calendar events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin') || new Date().toISOString();
    const timeMax = searchParams.get('timeMax') || undefined;

    const events = await listCalendarEvents(timeMin, timeMax);

    // Sync to local cache in background/opportunistically
    try {
      for (const ev of events) {
        if (!ev.id || !ev.start?.dateTime || !ev.end?.dateTime) continue;
        await supabaseServer.from('cached_events').upsert(
          {
            gcal_id: ev.id,
            summary: ev.summary || '(No Title)',
            description: ev.description || '',
            location: ev.location || '',
            start_time: ev.start.dateTime,
            end_time: ev.end.dateTime,
            attendees: ev.attendees || [],
            status: ev.status || 'confirmed',
            html_link: ev.htmlLink || '',
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'gcal_id',
          }
        );
      }
    } catch (dbErr) {
      console.error('Failed to update calendar event cache:', dbErr);
    }

    return NextResponse.json({ events });
  } catch (err: any) {
    console.error('Error listing calendar events:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Create a new event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { summary, description, location, start, end, attendees } = body;

    if (!summary || !start?.dateTime || !end?.dateTime) {
      return NextResponse.json(
        { error: 'Missing required fields: summary, start.dateTime, end.dateTime' },
        { status: 400 }
      );
    }

    const newEvent = await createCalendarEvent({
      summary,
      description,
      location,
      start,
      end,
      attendees,
    });

    return NextResponse.json({ success: true, event: newEvent });
  } catch (err: any) {
    console.error('Error creating calendar event:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
