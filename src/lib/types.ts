export interface Translation {
  title: string;
  language: string;
  english: string;
  hindi: string;
  marathi: string;
  notifications: string;
  push_notifications: string;
  email_notifications: string;
  sms_notifications: string;
  save_preferences: string;
  preferences_saved: string;
}

export interface Translations {
  [key: string]: Translation;
}
