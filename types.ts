
export interface Member {
  id: number;
  avatarUrl: string;
  name: {
    ja: string;
    en: string;
  };
  role: {
    ja: string;
    en: string;
  };
  bio: {
    ja: string;
    en: string;
  };
  tags?: {
    ja: string[];
    en: string[];
  };
}

// FullCalendar event structure
export interface CalendarEvent {
  title: string;
  start: string; // ISO8601 string
  end?: string;  // ISO8601 string (optional)
  allDay?: boolean; // All-day event flag
  color?: string;
}
