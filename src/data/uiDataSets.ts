// Migrated from old uiDataSets.js
// Reference: /tmp/old-admin-check/src/uiDataSets.js

export interface InputConfig {
  input: string;
  required: boolean;
}

export interface TitleTypeConfig {
  type: string;
  tabIndex: number;
  inputCfg: InputConfig[];
  showAdTracks: boolean;
  showIMDB: boolean;
}

export const titleTypeUiConfig: TitleTypeConfig[] = [
  {
    type: "movie",
    tabIndex: 0,
    inputCfg: [
      { input: "type", required: true },
      { input: "poster", required: false },
      { input: "audio", required: false },
      { input: "title", required: true },
      { input: "directors", required: true },
      { input: "writers", required: true },
      { input: "actors", required: true },
      { input: "runtimeMinutes", required: true },
      { input: "released", required: true },
      { input: "previewUrl", required: false },
      { input: "wheretowatch", required: false },
      { input: "score", required: true },
      { input: "categories", required: true },
      { input: "genre", required: true },
      { input: "synopsis", required: true },
      { input: "publicEnabled", required: true },
      { input: "year", required: false },
      { input: "rated", required: true },
    ],
    showAdTracks: true,
    showIMDB: true,
  },
  {
    type: "series",
    tabIndex: 1,
    inputCfg: [
      { input: "type", required: true },
      { input: "poster", required: false },
      { input: "title", required: true },
      { input: "directors", required: true },
      { input: "writers", required: true },
      { input: "actors", required: true },
      { input: "released", required: true },
      { input: "previewUrl", required: false },
      { input: "wheretowatch", required: false },
      { input: "score", required: true },
      { input: "categories", required: true },
      { input: "genre", required: true },
      { input: "synopsis", required: true },
      { input: "publicEnabled", required: true },
      { input: "year", required: false },
      { input: "rated", required: true },
    ],
    showAdTracks: false,
    showIMDB: true,
  },
  {
    type: "episode",
    tabIndex: 2,
    inputCfg: [
      { input: "type", required: true },
      { input: "poster", required: false },
      { input: "audio", required: false },
      { input: "subTitleSeries", required: true },
      { input: "episode", required: true },
      { input: "season", required: true },
      { input: "title", required: true },
      { input: "directors", required: false },
      { input: "writers", required: false },
      { input: "actors", required: false },
      { input: "runtimeMinutes", required: false },
      { input: "released", required: false },
      { input: "previewUrl", required: false },
      { input: "score", required: true },
      { input: "categories", required: false },
      { input: "genre", required: false },
      { input: "synopsis", required: false },
      { input: "publicEnabled", required: false },
      { input: "year", required: false },
      { input: "rated", required: true },
    ],
    showAdTracks: true,
    showIMDB: true,
  },
  {
    type: "book",
    tabIndex: 3,
    inputCfg: [
      { input: "type", required: true },
      { input: "poster", required: false },
      { input: "title", required: true },
      { input: "writers", required: true },
      { input: "actors", required: false },
      { input: "runtimeMinutes", required: false },
      { input: "released", required: true },
      { input: "score", required: true },
      { input: "categories", required: true },
      { input: "genre", required: true },
      { input: "synopsis", required: true },
      { input: "publicEnabled", required: false },
      { input: "year", required: false },
      { input: "rated", required: true },
    ],
    showAdTracks: false,
    showIMDB: false,
  },
  {
    type: "chapter",
    tabIndex: 4,
    inputCfg: [
      { input: "type", required: true },
      { input: "poster", required: false },
      { input: "subTitleBook", required: true },
      { input: "chapter", required: true },
      { input: "title", required: true },
      { input: "actors", required: false },
      { input: "runtimeMinutes", required: true },
      { input: "released", required: true },
      { input: "score", required: true },
      { input: "categories", required: true },
      { input: "genre", required: true },
      { input: "publicEnabled", required: false },
      { input: "year", required: false },
      { input: "rated", required: true },
    ],
    showAdTracks: true,
    showIMDB: false,
  },
  {
    type: "tour",
    tabIndex: 5,
    inputCfg: [
      { input: "type", required: true },
      { input: "poster", required: false },
      { input: "title", required: true },
      { input: "writers", required: true },
      { input: "runtimeMinutes", required: true },
      { input: "released", required: true },
      { input: "score", required: true },
      { input: "categories", required: true },
      { input: "genre", required: true },
      { input: "synopsis", required: true },
      { input: "publicEnabled", required: false },
      { input: "year", required: false },
      { input: "rated", required: true },
    ],
    showAdTracks: true,
    showIMDB: false,
  },
  {
    type: "radio",
    tabIndex: 6,
    inputCfg: [
      { input: "type", required: true },
      { input: "poster", required: false },
      { input: "title", required: true },
      { input: "directors", required: false },
      { input: "writers", required: true },
      { input: "runtimeMinutes", required: true },
      { input: "released", required: true },
      { input: "score", required: true },
      { input: "categories", required: true },
      { input: "genre", required: true },
      { input: "synopsis", required: true },
      { input: "publicEnabled", required: false },
      { input: "year", required: false },
      { input: "rated", required: true },
    ],
    showAdTracks: true,
    showIMDB: false,
  },
];

export const mimeTypeExtensionMapping = {
  images: [
    { mimeType: "image/webp", extension: ".webp" },
    { mimeType: "image/jpeg", extension: ".jpg" },
    { mimeType: "image/avif", extension: ".avif" },
    { mimeType: "image/avif-sequence", extension: ".avifs" },
    { mimeType: "image/png", extension: ".png" },
  ],
  audio: [
    { mimeType: "audio/mpeg", extension: ".mp3" },
  ],
  adTrackAudio: [
    { mimeType: "audio/wav", extension: ".wav" },
    { mimeType: "audio/mpeg", extension: ".mp3" },
    { mimeType: "audio/ogg", extension: ".oga" },
  ],
};

export const movieGenres = [
  "Action", "Adventure", "Animated", "Biography", "Comedy",
  "Crime", "Dance", "Disaster", "Documentary", "Drama",
  "Family", "Fantasy", "Found Footage", "Historical", "Horror",
  "Independent", "Legal", "Live Action", "Martial Arts", "Musical",
  "Mystery", "Noir", "Performance", "Political", "Romance",
  "Satire", "Science Fiction", "Short", "Silent", "Slasher",
  "Sports", "Spy", "Superhero", "Supernatural", "Suspense",
  "Teen", "Thriller", "War", "Western",
];

export const notificationIcons = [
  "movie", "new_releases", "featured_video", "note", "music_video",
  "radio", "subscriptions", "web", "video_library", "chat",
  "face", "info", "lightbulb", "lightbulb_outline", "loyalty", "theaters",
  "verified", "verified_user", "add_alert", "tag_faces",
];

export const notificationColors = [
  "blue", "green", "red", "orange", "pink", "cyan", "purple",
];

export const languages = [
  { name: "Afar", code: "aa", a3_code: "aar" },
  { name: "Abkhazian", code: "ab", a3_code: "abk" },
  { name: "Afrikaans", code: "af", a3_code: "afr" },
  { name: "Akan", code: "ak", a3_code: "aka" },
  { name: "Albanian", code: "sq", a3_code: "alb" },
  { name: "Amharic", code: "am", a3_code: "amh" },
  { name: "Arabic", code: "ar", a3_code: "ara" },
  { name: "Armenian", code: "hy", a3_code: "arm" },
  { name: "Assamese", code: "as", a3_code: "asm" },
  { name: "Aymara", code: "ay", a3_code: "aym" },
  { name: "Azerbaijani", code: "az", a3_code: "aze" },
  { name: "Bashkir", code: "ba", a3_code: "bak" },
  { name: "Bambara", code: "bm", a3_code: "bam" },
  { name: "Basque", code: "eu", a3_code: "baq" },
  { name: "Belarusian", code: "be", a3_code: "bel" },
  { name: "Bengali", code: "bn", a3_code: "ben" },
  { name: "Bosnian", code: "bs", a3_code: "bos" },
  { name: "Breton", code: "br", a3_code: "bre" },
  { name: "Bulgarian", code: "bg", a3_code: "bul" },
  { name: "Burmese", code: "my", a3_code: "bur" },
  { name: "Catalan", code: "ca", a3_code: "cat" },
  { name: "Chinese", code: "zh", a3_code: "chi" },
  { name: "Czech", code: "cs", a3_code: "cze" },
  { name: "Danish", code: "da", a3_code: "dan" },
  { name: "Dutch", code: "nl", a3_code: "dut" },
  { name: "English", code: "en", a3_code: "eng" },
  { name: "Esperanto", code: "eo", a3_code: "epo" },
  { name: "Estonian", code: "et", a3_code: "est" },
  { name: "Finnish", code: "fi", a3_code: "fin" },
  { name: "French", code: "fr", a3_code: "fre" },
  { name: "Georgian", code: "ka", a3_code: "geo" },
  { name: "German", code: "de", a3_code: "ger" },
  { name: "Greek", code: "el", a3_code: "gre" },
  { name: "Gujarati", code: "gu", a3_code: "guj" },
  { name: "Hausa", code: "ha", a3_code: "hau" },
  { name: "Hebrew", code: "he", a3_code: "heb" },
  { name: "Hindi", code: "hi", a3_code: "hin" },
  { name: "Hungarian", code: "hu", a3_code: "hun" },
  { name: "Icelandic", code: "is", a3_code: "ice" },
  { name: "Indonesian", code: "id", a3_code: "ind" },
  { name: "Italian", code: "it", a3_code: "ita" },
  { name: "Japanese", code: "ja", a3_code: "jpn" },
  { name: "Kazakh", code: "kk", a3_code: "kaz" },
  { name: "Korean", code: "ko", a3_code: "kor" },
  { name: "Kurdish", code: "ku", a3_code: "kur" },
  { name: "Latin", code: "la", a3_code: "lat" },
  { name: "Latvian", code: "lv", a3_code: "lav" },
  { name: "Lithuanian", code: "lt", a3_code: "lit" },
  { name: "Macedonian", code: "mk", a3_code: "mac" },
  { name: "Malay", code: "ms", a3_code: "may" },
  { name: "Malayalam", code: "ml", a3_code: "mal" },
  { name: "Maltese", code: "mt", a3_code: "mlt" },
  { name: "Mongolian", code: "mn", a3_code: "mon" },
  { name: "Nepali", code: "ne", a3_code: "nep" },
  { name: "Norwegian", code: "no", a3_code: "nor" },
  { name: "Persian", code: "fa", a3_code: "per" },
  { name: "Polish", code: "pl", a3_code: "pol" },
  { name: "Portuguese", code: "pt", a3_code: "por" },
  { name: "Romanian", code: "ro", a3_code: "rum" },
  { name: "Russian", code: "ru", a3_code: "rus" },
  { name: "Samoan", code: "sm", a3_code: "smo" },
  { name: "Serbian", code: "sr", a3_code: "srp" },
  { name: "Sinhala", code: "si", a3_code: "sin" },
  { name: "Slovak", code: "sk", a3_code: "slo" },
  { name: "Slovenian", code: "sl", a3_code: "slv" },
  { name: "Somali", code: "so", a3_code: "som" },
  { name: "Spanish", code: "es", a3_code: "spa" },
  { name: "Swahili", code: "sw", a3_code: "swa" },
  { name: "Swedish", code: "sv", a3_code: "swe" },
  { name: "Tagalog", code: "tl", a3_code: "tgl" },
  { name: "Tamil", code: "ta", a3_code: "tam" },
  { name: "Thai", code: "th", a3_code: "tha" },
  { name: "Tibetan", code: "bo", a3_code: "tib" },
  { name: "Tigrinya", code: "ti", a3_code: "tir" },
  { name: "Tswana", code: "tn", a3_code: "tsn" },
  { name: "Turkish", code: "tr", a3_code: "tur" },
  { name: "Ukrainian", code: "uk", a3_code: "ukr" },
  { name: "Urdu", code: "ur", a3_code: "urd" },
  { name: "Uzbek", code: "uz", a3_code: "uzb" },
  { name: "Vietnamese", code: "vi", a3_code: "vie" },
  { name: "Welsh", code: "cy", a3_code: "wel" },
  { name: "Xhosa", code: "xh", a3_code: "xho" },
  { name: "Yoruba", code: "yo", a3_code: "yor" },
  { name: "Zulu", code: "zu", a3_code: "zul" },
];

// Helper: get config for a given content type
export function getTypeConfig(type: string): TitleTypeConfig | undefined {
  return titleTypeUiConfig.find((c) => c.type === type);
}

// Helper: check if a field is visible for a given type
export function isFieldVisible(type: string, fieldName: string): boolean {
  const config = getTypeConfig(type);
  if (!config) return false;
  return config.inputCfg.some((i) => i.input === fieldName);
}

// Helper: check if a field is required for a given type
export function isFieldRequired(type: string, fieldName: string): boolean {
  const config = getTypeConfig(type);
  if (!config) return false;
  const field = config.inputCfg.find((i) => i.input === fieldName);
  return field?.required ?? false;
}

// Type options for the Select dropdown (tabIndex-ordered)
export const typeOptions = titleTypeUiConfig.map((c) => ({
  value: c.type,
  label: c.type.charAt(0).toUpperCase() + c.type.slice(1),
}));