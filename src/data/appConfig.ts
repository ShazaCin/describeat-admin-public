// Migrated from old appConfig.js + S3 path conventions
// Reference: /tmp/old-admin-check/src/appConfig.js + titleEditor.vue S3 paths

export const appConfig = {
  // RapidAPI (IMDB search)
  rapidApiHost: import.meta.env.VITE_RAPIDAPI_HOST || "your-rapidapi-host",
  rapidApiKey: import.meta.env.VITE_RAPIDAPI_KEY || "YOUR_RAPIDAPI_KEY",

  // S3 buckets
  buckets: {
    staticContent: import.meta.env.VITE_S3_STATIC_CONTENT_BUCKET || "your-static-content-bucket",       // poster images + AD track audio
    audioProcessing: import.meta.env.VITE_S3_AUDIO_PROCESSING_BUCKET || "your-audio-processing-bucket",               // original audio upload + processed audio
  },

  // S3 region
  region: import.meta.env.VITE_AWS_REGION || "your-region",

  // S3 path templates (use these to construct upload/download paths)
  paths: {
    // Poster image upload: simg/{timestamp}/{title}_{timestamp}{ext}
    poster: (timestamp: number, title: string, ext: string) =>
      `simg/${timestamp}/${title.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}${ext}`,

    // Original audio upload: audio-tracks-to-process/{titleId}{ext}
    audioUpload: (titleId: string, ext: string) =>
      `audio-tracks-to-process/${titleId}${ext}`,

    // Processed audio (read-only): audio-tracks-processed/{titleId}.mp3
    audioProcessed: (titleId: string) =>
      `audio-tracks-processed/${titleId}.mp3`,

    // AD track audio upload: audio-description-tracks-to-process/adtracks/{titleId}/{trackId}{ext}
    adTrackUpload: (titleId: string, trackId: string, ext: string) =>
      `audio-description-tracks-to-process/adtracks/${titleId}/${trackId}${ext}`,

    // AD track audio — relative S3 path for use with Amplify getUrl (signed, bypasses CORS)
    adTrackPath: (titleId: string, trackId: string) =>
      `adtracks/${titleId}/${trackId}.mp3`,
  },

  // Poster image URL format (public bucket, no signing needed)
  posterUrl: (imagePath: string) =>
    `${import.meta.env.VITE_CDN_DOMAIN || 'https://your-cdn-domain.com'}/${imagePath}`,

  // AD track audio URL format (public bucket, same as poster)
  adTrackAudioUrl: (titleId: string, trackId: string) =>
    `${import.meta.env.VITE_CDN_DOMAIN || 'https://your-cdn-domain.com'}/adtracks/${titleId}/${trackId}.mp3`,
};

