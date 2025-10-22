// * locale
export const LANGUAGES = ['en-US', 'ko-KR'] as const;
export const DEFAULT_LANGUAGE = 'en-US';

// * theme
export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export enum CalendalType {
  PERSONAL = 'personal',
  TEAM = 'team',
  SALES = 'sales',
  GENERAL = 'general',
}

export enum CurrentView {
  WEEK = 'timeGridWeek',
  MONTH = 'dayGridMonth',
  DAY = 'timeGridDay',
}
