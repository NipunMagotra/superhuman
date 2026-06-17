import { corsair } from './corsair';

export interface CalendarEventPayload {
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: { email: string; displayName?: string; responseStatus?: string }[];
}

export function mapGoogleEvent(ev: any) {
  return {
    id: ev.id,
    gcal_id: ev.id,
    summary: ev.summary || '(No Title)',
    description: ev.description || '',
    location: ev.location || '',
    start_time: ev.start?.dateTime || ev.start?.date || '',
    end_time: ev.end?.dateTime || ev.end?.date || '',
    attendees: ev.attendees || [],
    status: ev.status || 'confirmed',
    html_link: ev.htmlLink || '',
  };
}

export async function listCalendarEvents(timeMin?: string, timeMax?: string, maxResults = 250) {
  const response = await corsair.googlecalendar.api.events.getMany({
    calendarId: 'primary',
    timeMin: timeMin || new Date().toISOString(),
    timeMax,
    singleEvents: true,
    orderBy: 'startTime',
    maxResults,
  });

  return response.items || [];
}

export async function getCalendarEvent(id: string) {
  return await corsair.googlecalendar.api.events.get({
    calendarId: 'primary',
    id,
  });
}

export async function createCalendarEvent(event: CalendarEventPayload) {
  return await corsair.googlecalendar.api.events.create({
    calendarId: 'primary',
    event: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: event.start,
      end: event.end,
      attendees: event.attendees as any,
    },
    sendUpdates: 'all',
  });
}

export async function updateCalendarEvent(id: string, event: Partial<CalendarEventPayload>) {
  return await corsair.googlecalendar.api.events.update({
    calendarId: 'primary',
    id,
    event: {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: event.start,
      end: event.end,
      attendees: event.attendees as any,
    },
    sendUpdates: 'all',
  });
}

export async function deleteCalendarEvent(id: string) {
  return await corsair.googlecalendar.api.events.delete({
    calendarId: 'primary',
    id,
    sendUpdates: 'all',
  });
}
