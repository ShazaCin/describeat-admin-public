import { useState, useCallback } from "react";
import { Search, Loader2, Film } from "lucide-react";
import { appConfig } from "@/data/appConfig";

export interface IMDBMetadata {
  title: string;
  year: string;
  rated: string;
  released: string;
  runtimeMinutes: string;
  genre: string;
  categories: string[];
  directors: string[];
  writers: string[];
  actors: string[];
  score: string;
  synopsis: string;
  posterUrl: string | null;
}

export interface IMDBSearchProps {
  onSelect: (metadata: IMDBMetadata) => void;
  visible: boolean;
}

interface IMDBSearchResult {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}

const API_HOST = appConfig.rapidApiHost;
const API_KEY = appConfig.rapidApiKey;

async function searchIMDB(query: string): Promise<IMDBSearchResult[]> {
  const url = `https://${API_HOST}/?s=${encodeURIComponent(query)}&r=json&page=1`;
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-host": API_HOST,
      "x-rapidapi-key": API_KEY,
    },
  });
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  if (data.Response === "False") return [];
  return data.Search ?? [];
}

async function getIMDBDetails(imdbID: string): Promise<IMDBMetadata> {
  const url = `https://${API_HOST}/?i=${encodeURIComponent(imdbID)}&r=json`;
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-host": API_HOST,
      "x-rapidapi-key": API_KEY,
    },
  });
  if (!res.ok) throw new Error(`Details fetch failed: ${res.status}`);
  const d = await res.json();
  if (d.Response === "False") throw new Error(d.Error ?? "Title not found");

  const runtimeMatch = (d.Runtime ?? "").match(/(\d+)/);
  const genreList = (d.Genre ?? "")
    .split(",")
    .map((s: string) => s.trim())
    .filter((s: string) => Boolean(s) && s !== "N/A");

  return {
    title: d.Title ?? "",
    year: d.Year?.toString() ?? "",
    rated: d.Rated && d.Rated !== "N/A" ? d.Rated : "",
    released: d.Released && d.Released !== "N/A" ? d.Released : "",
    runtimeMinutes: runtimeMatch ? runtimeMatch[1] : "",
    genre: genreList[0] ?? "",
    categories: genreList,
    directors: (d.Director ?? "")
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => Boolean(s) && s !== "N/A"),
    writers: (d.Writer ?? "")
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => Boolean(s) && s !== "N/A"),
    actors: (d.Actors ?? "")
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => Boolean(s) && s !== "N/A"),
    score: d.imdbRating && d.imdbRating !== "N/A" ? parseFloat(d.imdbRating).toString() : "",
    synopsis: d.Plot ?? "",
    posterUrl: d.Poster && d.Poster !== "N/A" ? d.Poster : null,
  };
}

export function IMDBSearch({ onSelect, visible }: IMDBSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<IMDBSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setShowResults(true);
    try {
      const data = await searchIMDB(query.trim());
      setResults(data);
      if (data.length === 0) {
        setError("No results found");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const handleSelect = useCallback(
    async (result: IMDBSearchResult) => {
      setLoadingDetails(result.imdbID);
      setError(null);
      try {
        const metadata = await getIMDBDetails(result.imdbID);
        onSelect(metadata);
        setShowResults(false);
        setResults([]);
        setQuery("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load details");
      } finally {
        setLoadingDetails(null);
      }
    },
    [onSelect]
  );

  if (!visible) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <h3 className="mb-3 text-sm font-medium text-slate-300">Search IMDB</h3>

      {/* Search Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search movies, series, episodes..."
          aria-label="Search IMDB database"
          className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-600 disabled:opacity-50 focus:ring-2 focus:ring-slate-500 focus:outline-none"
        >
          {searching ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
          Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">{error}</p>
      )}

      {/* Results */}
      {showResults && results.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-slate-500">
            Click a result to auto-fill title metadata
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
            {results.map((r) => (
              <button
                key={r.imdbID}
                onClick={() => handleSelect(r)}
                disabled={loadingDetails !== null}
                className="group flex w-36 shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 text-left transition-colors hover:border-slate-500 hover:bg-slate-800 disabled:opacity-50 focus:ring-2 focus:ring-slate-500 focus:outline-none"
              >
                {/* Poster thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                  {r.Poster && r.Poster !== "N/A" ? (
                    <img
                      src={r.Poster}
                      alt={r.Title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Film size={24} className="text-slate-600" />
                    </div>
                  )}
                  {/* Loading overlay */}
                  {loadingDetails === r.imdbID && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70">
                      <Loader2 size={20} className="animate-spin text-slate-300" />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-slate-200">
                    {r.Title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {r.Type} • {r.Year}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}