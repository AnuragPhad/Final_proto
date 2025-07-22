export type Language = 'en' | 'hi' | 'mr';

export interface Translation {
  // Settings
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

  // Header
  kisan_ai: string;
  
  // Dashboard
  welcome_to_kisan_ai: string;
  welcome_subtitle: string;
  mandi_rates_title: string;
  mandi_rates_desc: string;
  crop_doctor_title: string;
  crop_doctor_desc: string;
  commodity_intel_title: string;
  commodity_intel_desc: string;
  govt_schemes_title: string;
  govt_schemes_desc: string;
  settings_title: string;
  settings_desc: string;

  // Mandi Rates
  mandi_rates_page_title: string;
  mandi_rates_page_subtitle: string;
  tap_to_search_voice: string;
  listening: string;
  voice_search_not_supported: string;
  ai_summary: string;
  or_filter_manually: string;
  filter_desc: string;
  select_state: string;
  select_district: string;
  pick_a_date: string;
  clear_filters_refresh: string;
  use_my_location: string;
  price_trends_for: string;
  last_30_days_prices: string;
  ai_selling_advice: string;
  not_enough_data_for_trend: string;
  rates_for: string;
  on: string;
  filtered_by: string;
  clear_filter: string;
  table_view: string;
  tile_view: string;
  no_data_for_criteria: string;

  // Commodity Intelligence
  commodity_intel_page_title: string;
  commodity_intel_page_subtitle: string;
  select_commodity_loc: string;
  analysis_for: string;
  in: string;
  price_trend: string;
  last_30_days_modal_prices: string;
  no_data_for_trend_analysis: string;
  no_trend_advice_available: string;
  cross_market_analysis: string;
  cross_market_desc: string;
  ai_market_insight: string;
  no_market_analysis_available: string;

  // Crop Doctor
  crop_doctor_page_title: string;
  crop_doctor_page_subtitle: string;
  upload_crop_image: string;
  upload_crop_image_desc: string;
  image_preview_placeholder: string;
  choose_file: string;
  use_camera: string;
  analyze_crop_health: string;
  analyzing: string;
  ai_analysis_report: string;
  health_status: string;
  ai_summary_title: string;
  organic_solutions: string;
  inorganic_solutions: string;
  water_weather_advisory: string;
  find_nearby_shops: string;
  find_nearby_shops_desc: string;

  // Govt Schemes
  govt_schemes_page_title: string;
  govt_schemes_page_subtitle: string;
  learn_more: string;
}

export interface Translations {
  [key: string]: Translation;
}
