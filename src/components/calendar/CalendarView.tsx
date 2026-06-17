'use client';

import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Users, Plus } from 'lucide-react';

interface Event {
  id: string;
  gcal_id: string;
  summary: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  attendees?: { email: string; responseStatus?: string }[];
  status: string;
}

interface CalendarViewProps {
  events: Event[];
  onCreateEvent: (date: Date) => void;
  onEditEvent: (event: Event) => void;
}

export function CalendarView({ events, onCreateEvent, onEditEvent }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Calculate current week days
  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));

  // Filter events for the selected date
  const selectedDateEvents = events.filter((event) => {
    if (event.status === 'cancelled') return false;
    return isSameDay(new Date(event.start_time), selectedDate);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-hidden">
      {/* Upper Weekday Slider Bar */}
      <div className="h-16 border-b border-border-primary/40 px-6 flex items-center justify-between bg-bg-secondary/40">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <CalendarIcon className="w-4 h-4 text-accent-red" />
          <span>{format(selectedDate, 'MMMM yyyy')}</span>
        </div>

        <button
          onClick={() => onCreateEvent(selectedDate)}
          className="flex items-center gap-1.5 px-3 py-1 bg-accent-red hover:bg-accent-red-hover text-white text-xs font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Event
        </button>
      </div>

      {/* Week Day Selector Selector row */}
      <div className="border-b border-border-primary/20 px-6 py-4 bg-bg-secondary/20 flex gap-2 overflow-x-auto">
        {weekDays.map((day, idx) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const dayEvents = events.filter((e) => e.status !== 'cancelled' && isSameDay(new Date(e.start_time), day));

          return (
            <button
              key={idx}
              onClick={() => setSelectedDate(day)}
              className={`flex-1 min-w-[56px] py-2.5 rounded-xl flex flex-col items-center gap-1.5 border transition-all duration-150 relative ${
                isSelected
                  ? 'bg-bg-hover text-accent-red border-accent-red/30'
                  : 'bg-transparent border-transparent text-text-muted hover:text-text-primary hover:bg-bg-hover/30'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider">
                {format(day, 'eee')}
              </span>
              <span
                className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                  isToday && !isSelected
                    ? 'bg-accent-red/10 text-accent-red border border-accent-red/20'
                    : isToday && isSelected
                    ? 'bg-accent-red text-white'
                    : ''
                }`}
              >
                {format(day, 'd')}
              </span>

              {/* Little dots for events on that day */}
              {dayEvents.length > 0 && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-accent-red/60" />
              )}
            </button>
          );
        })}
      </div>

      {/* Timeline view of selected date events */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
        {selectedDateEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-text-dim text-sm gap-2">
            <span>No events scheduled for this day</span>
            <button
              onClick={() => onCreateEvent(selectedDate)}
              className="text-xs text-accent-red hover:underline"
            >
              Create one now
            </button>
          </div>
        ) : (
          <div className="relative border-l border-border-primary/60 ml-3 pl-6 flex flex-col gap-6">
            {selectedDateEvents.map((event) => {
              const start = new Date(event.start_time);
              const end = new Date(event.end_time);
              const timeStr = `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;

              return (
                <div
                  key={event.id || event.gcal_id}
                  onClick={() => onEditEvent(event)}
                  className="relative group bg-bg-secondary border border-border-primary hover:border-border-hover p-4 rounded-xl cursor-pointer transition-all duration-200"
                >
                  {/* Timeline bullet dot */}
                  <span className="absolute -left-[31px] top-5 w-2.5 h-2.5 rounded-full border border-bg-primary bg-accent-red group-hover:scale-125 transition-transform" />

                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-semibold text-text-primary text-sm group-hover:text-accent-red transition-colors">
                      {event.summary}
                    </h3>
                    <span className="text-xs text-text-dim font-medium">{timeStr}</span>
                  </div>

                  {event.description && (
                    <p className="text-xs text-text-muted mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-[11px] text-text-dim">
                    {event.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-text-dim/60" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-text-dim/60" />
                        <span>{event.attendees.length} attendees</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
