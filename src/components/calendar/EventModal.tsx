'use client';

import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, FileText, Trash2, Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id?: string;
  gcal_id?: string;
  summary: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  attendees?: { email: string }[];
  status?: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null; // Null means creating new
  selectedDate: Date;
  onSave: (eventData: any) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
}

export function EventModal({
  isOpen,
  onClose,
  event,
  selectedDate,
  onSave,
  onDelete,
}: EventModalProps) {
  const start = event ? new Date(event.start_time) : selectedDate;
  const end = event ? new Date(event.end_time) : new Date(selectedDate.getTime() + 60 * 60 * 1000);

  const [summary, setSummary] = useState(event ? event.summary : '');
  const [description, setDescription] = useState(event ? event.description || '' : '');
  const [location, setLocation] = useState(event ? event.location || '' : '');
  const [startDateStr, setStartDateStr] = useState(format(start, 'yyyy-MM-dd'));
  const [startTimeStr, setStartTimeStr] = useState(format(start, 'HH:mm'));
  const [endDateStr, setEndDateStr] = useState(format(end, 'yyyy-MM-dd'));
  const [endTimeStr, setEndTimeStr] = useState(format(end, 'HH:mm'));
  const [attendeesStr, setAttendeesStr] = useState(event ? (event.attendees || []).map((a) => a.email).join(', ') : '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim() || !startDateStr || !startTimeStr || !endDateStr || !endTimeStr) return;

    setIsSaving(true);
    const startDateTime = new Date(`${startDateStr}T${startTimeStr}:00`).toISOString();
    const endDateTime = new Date(`${endDateStr}T${endTimeStr}:00`).toISOString();

    const attendees = attendeesStr
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email !== '')
      .map((email) => ({ email }));

    const eventData = {
      summary,
      description,
      location,
      start: { dateTime: startDateTime },
      end: { dateTime: endDateTime },
      attendees,
    };

    const success = await onSave(eventData);
    setIsSaving(false);

    if (success) {
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
        setSaveSuccess(false);
      }, 1200);
    }
  };

  const handleDelete = async () => {
    const id = event?.gcal_id || event?.id;
    if (!id || !onDelete) return;

    if (window.confirm('Are you sure you want to cancel this event?')) {
      setIsDeleting(true);
      const success = await onDelete(id);
      setIsDeleting(false);
      if (success) {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[#0b0c0f] border border-[#dc2626]/15 rounded-xl overflow-hidden shadow-2xl shadow-[0_0_20px_rgba(220,38,38,0.06)] font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-primary/40 flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">
            {event ? 'Edit Event' : 'Schedule Event'}
          </span>
          <button onClick={onClose} className="text-text-dim hover:text-text-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Summary Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-dim">Title</label>
            <div className="flex items-center bg-bg-tertiary border border-border-primary hover:border-border-hover focus-within:border-accent-red rounded-lg px-3 py-1.5 transition-all">
              <Calendar className="w-4 h-4 text-text-dim mr-2" />
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Product design review meeting"
                className="bg-transparent text-sm text-text-primary placeholder:text-text-dim focus:outline-none w-full"
                required
              />
            </div>
          </div>

          {/* Start and End Times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-dim">Start</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={startDateStr}
                  onChange={(e) => setStartDateStr(e.target.value)}
                  className="bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none w-full"
                  required
                />
                <input
                  type="time"
                  value={startTimeStr}
                  onChange={(e) => setStartTimeStr(e.target.value)}
                  className="bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none w-20"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-dim">End</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={endDateStr}
                  onChange={(e) => setEndDateStr(e.target.value)}
                  className="bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none w-full"
                  required
                />
                <input
                  type="time"
                  value={endTimeStr}
                  onChange={(e) => setEndTimeStr(e.target.value)}
                  className="bg-bg-tertiary border border-border-primary rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none w-20"
                  required
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-dim">Location / Link</label>
            <div className="flex items-center bg-bg-tertiary border border-border-primary hover:border-border-hover focus-within:border-accent-red rounded-lg px-3 py-1.5 transition-all">
              <MapPin className="w-4 h-4 text-text-dim mr-2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Google Meet Link or Office Room"
                className="bg-transparent text-sm text-text-primary placeholder:text-text-dim focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Attendees */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-dim">Attendees (comma separated emails)</label>
            <div className="flex items-center bg-bg-tertiary border border-border-primary hover:border-border-hover focus-within:border-accent-red rounded-lg px-3 py-1.5 transition-all">
              <Users className="w-4 h-4 text-text-dim mr-2" />
              <input
                type="text"
                value={attendeesStr}
                onChange={(e) => setAttendeesStr(e.target.value)}
                placeholder="bob@example.com, alice@example.com"
                className="bg-transparent text-sm text-text-primary placeholder:text-text-dim focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-dim">Notes / Description</label>
            <div className="flex items-start bg-bg-tertiary border border-border-primary hover:border-border-hover focus-within:border-accent-red rounded-lg px-3 py-1.5 transition-all">
              <FileText className="w-4 h-4 text-text-dim mr-2 mt-1" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add meeting agenda or notes..."
                rows={3}
                className="bg-transparent text-sm text-text-primary placeholder:text-text-dim focus:outline-none w-full resize-none"
              />
            </div>
          </div>

          {/* Actions Footer */}
          <div className="border-t border-border-primary/40 pt-4 mt-2 flex justify-between items-center">
            {event && onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1 text-xs text-accent-red hover:underline disabled:opacity-50"
              >
                {isDeleting ? (
                  'Cancelling...'
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Cancel Event
                  </>
                )}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 hover:bg-bg-hover text-xs text-text-secondary rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSaving || !summary.trim()}
                className={`flex items-center gap-1.5 px-5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-200 ${
                  saveSuccess
                    ? 'bg-green-600'
                    : 'bg-accent-red hover:bg-accent-red-hover disabled:opacity-50 disabled:pointer-events-none'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Scheduled!
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Schedule'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
