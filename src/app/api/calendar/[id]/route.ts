import { NextResponse } from 'next/server';
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/calendar';
import { supabaseServer } from '@/lib/supabase';

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

    // Sync to cache
    try {
      if (updatedEvent.id && updatedEvent.start?.dateTime && updatedEvent.end?.dateTime) {
        await supabaseServer.from('cached_events').upsert(
          {
            gcal_id: updatedEvent.id,
            summary: updatedEvent.summary || '(No Title)',
            description: updatedEvent.description || '',
            location: updatedEvent.location || '',
            start_time: updatedEvent.start.dateTime,
            end_time: updatedEvent.end.dateTime,
            attendees: updatedEvent.attendees || [],
            status: updatedEvent.status || 'confirmed',
            html_link: updatedEvent.htmlLink || '',
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'gcal_id',
          }
        );
      }
    } catch (dbErr) {
      console.error('Failed to update event cache on patch:', dbErr);
    }

    return NextResponse.json({ success: true, event: updatedEvent });
  } catch (err: any) {
    console.error('Error updating calendar event:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Cancel/delete calendar event
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await deleteCalendarEvent(id);

    // Update status in local cache
    try {
      await supabaseServer
        .from('cached_events')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('gcal_id', id);
    } catch (dbErr) {
      console.error('Failed to update event cache status to cancelled:', dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting calendar event:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
