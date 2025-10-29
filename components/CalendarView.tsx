
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import ICAL from 'ical.js';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarEvent } from '../types';
import LoadingSpinner from './LoadingSpinner';

// Note for deployment on GitHub Pages: Set VITE_ICAL_URL in your repo's secrets and GitHub Actions workflow.
// To avoid CORS issues, use a CORS proxy if the iCal server doesn't allow cross-origin requests.
// Example: `https://cors-anywhere.herokuapp.com/https://your-ical-url.ics`
// FIX: Cast import.meta to any to resolve TypeScript error with Vite env variables.
const ICAL_URL = (import.meta as any).env.VITE_ICAL_URL;

const CalendarView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndParseIcal = useCallback(async () => {
    if (!ICAL_URL) {
      console.warn("VITE_ICAL_URL is not set. Using mock data.");
      // Mock data for preview when URL is not available
      const mockEvents: CalendarEvent[] = [
        { title: t('attendance'), start: '2025-11-03', color: '#10B981' },
        { title: t('attendance'), start: '2025-11-05', color: '#10B981' },
        { title: t('attendance'), start: '2025-11-12', color: '#10B981' },
        { title: t('attendance'), start: '2025-11-18', color: '#10B981' },
        { title: t('attendance'), start: '2025-11-25', color: '#10B981' },
      ];
      setEvents(mockEvents);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(ICAL_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/calendar') && !contentType.includes('text/plain')) {
        console.warn('The fetched resource does not appear to be an iCal file (content-type:', contentType, ').');
      }
      const icalText = await response.text();
      const jcalData = ICAL.parse(icalText);
      const component = new ICAL.Component(jcalData);
      const vevents = component.getAllSubcomponents('vevent');

      const parsedEvents: CalendarEvent[] = vevents.map((vevent: any) => {
        const event = new ICAL.Event(vevent);
        const isAllDay = event.startDate.isDate;
        const startISO = event.startDate.toJSDate().toISOString();
        const endISO = event.endDate ? event.endDate.toJSDate().toISOString() : undefined;
        return {
          title: event.summary || t('attendance'),
          start: startISO,
          end: endISO,
          allDay: isAllDay || undefined,
          color: '#10B981'
        } as CalendarEvent;
      });
      
      setEvents(parsedEvents);
    } catch (err) {
      console.error("Failed to fetch or parse iCal data:", err);
      console.info('Tip: For external iCal URLs, browsers require CORS. In development, set VITE_ICAL_UPSTREAM in .env.local and use VITE_ICAL_URL=/ical to proxy via Vite. For production on static hosting, host the .ics under public/ or use a server/worker proxy.');
      setError(t('calendarError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAndParseIcal();
    const interval = setInterval(fetchAndParseIcal, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAndParseIcal]);

  return (
    <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
      <div style={{ height: '400px' }}>
        {isLoading && <div className='h-full flex flex-col justify-center items-center'><LoadingSpinner /><p className='mt-4 text-gray-400'>{t('calendarLoading')}</p></div>}
        {error && <div className="text-red-400 text-center h-full flex items-center justify-center">{error}</div>}
        {!isLoading && !error && (
          <FullCalendar
            key={i18n.language} // Re-render on language change
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="100%"
            locale={i18n.language}
            views={{
              timeGridWeek: {
                // モバイルでの重なり回避のため、週ビューの列ヘッダを短くする
                // 例: "10/24" のみ表示（曜日は省略）
                dayHeaderFormat: { month: 'numeric', day: 'numeric' }
              }
            }}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            fixedWeekCount={false}
          />
        )}
      </div>
    </section>
  );
};

export default CalendarView;
