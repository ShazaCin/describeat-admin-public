import { useState, useRef, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface AudioPlayerProps {
  src?: string;
  className?: string;
}

export function AudioPlayer({ src, className }: AudioPlayerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
  }, [src]);

  if (!src) return null;

  if (error) {
    return (
      <div
        className={`flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-400 ${className ?? ""}`}
        role="alert"
      >
        <AlertCircle size={16} className="text-red-400" />
        <span>Audio unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-400" role="status">
          <Loader2 size={16} className="animate-spin" />
          <span>Loading audio...</span>
        </div>
      )}
      <audio
        ref={audioRef}
        controls
        src={src}
        className={`w-full ${loading ? "invisible absolute" : ""}`}
        onCanPlayThrough={() => setLoading(false)}
        onLoadedData={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}