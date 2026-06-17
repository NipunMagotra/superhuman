import { NextResponse } from 'next/server';
import { listCalendarEvents, createCalendarEvent, mapGoogleEvent } from '@/lib/calendar';

// GET: List calendar events from Google Calendar
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get('timeMin') || new Date().toISOString();
    const timeMax = searchParams.get('timeMax') || undefined;

    const events = await listCalendarEvents(timeMin, timeMax);
    return NextResponse.json({ events: events.map(mapGoogleEvent) });
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

    return NextResponse.json({ success: true, event: mapGoogleEvent(newEvent) });
  } catch (err: any) {
    console.error('Error creating calendar event:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
