import { NextResponse } from 'next/server';
import { updateCalendarEvent, deleteCalendarEvent, mapGoogleEvent } from '@/lib/calendar';

// PATCH: Update calendar event
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { summary, description, location, start, end, attendees } = body;

    const updatedEvent = await updateCalendarEvent(id, {
      summary,
      description,
      location,
      start,
      end,
      attendees,
    });

    return NextResponse.json({ success: true, event: mapGoogleEvent(updatedEvent) });
  } catch (err: any) {
    console.error('Error updating calendar event:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Cancel/delete calendar event
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteCalendarEvent(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting calendar event:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
