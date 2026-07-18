import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Loader2, Image, X, Upload, Pencil } from "lucide-react";
import { uploadData, getUrl } from "aws-amplify/storage";
import { graphqlQuery, graphqlMutation } from "@/services/amplifyClient";
import {
  getShazacinMetadataTitle,
  listShazacinMetadataAdTracks,
  listShazacinMetadataTitles,
} from "@/graphql/queries";
import {
  createShazacinMetadataTitles,
  updateShazacinMetadataTitles,
  createShazacinMetadataAdTracks,
  updateShazacinMetadataAdTracks,
  deleteShazacinMetadataAdTracks,
} from "@/graphql/mutations";
import type {
  ShazacinMetadataTitle,
  ShazacinMetadataAdTrack,
  ListResponse,
} from "@/types/graphql";
import { TextInput } from "@/components/forms/TextInput";
import { TextArea } from "@/components/forms/TextArea";
import { Select } from "@/components/forms/Select";
import { ChipsInput } from "@/components/forms/ChipsInput";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { DataTable } from "@/components/ui/DataTable";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useToastStore } from "@/stores/toastStore";
import { IMDBSearch, type IMDBMetadata } from "@/components/IMDBSearch";
import { appConfig } from "@/data/appConfig";
import { mimeTypeExtensionMapping, typeOptions, languages, isFieldVisible, isFieldRequired, getTypeConfig, movieGenres } from "@/data/uiDataSets";

const languageOptions = languages.map((l) => ({ value: l.code, label: l.name }));

const wheretowatchSuggestions = [
  "Netflix", "Amazon Prime Video", "Disney+", "Apple TV+", "Hulu", "HBO Max", "Showmax",
];

interface TitleForm {
  title: string;
  type: string;
  categories: string;
  actors: string;
  directors: string;
  writers: string;
  genre: string;
  synopsis: string;
  year: string;
  released: string;
  rated: string;
  runtimeMinutes: string;
  score: string;
  previewUrl: string;
  wheretowatch: string;
  publicEnabled: boolean;
  images: string[]; // S3 paths for poster images
  parentId: string;
  season: string;
  episode: string;
  chapter: string;
}

interface TrackForm {
  name: string;
  narratedLanguage: string;
  narrator: string;
  trackUrl: string;
  trackPosition: string;
  publicEnabled: boolean;
  releaseDate: string;
  magic_adjust: string;
}

const emptyTitleForm: TitleForm = {
  title: "", type: "movie", categories: "", actors: "",
  directors: "", writers: "", genre: "", synopsis: "",
  year: "", released: "", rated: "PG", runtimeMinutes: "",
  score: "", previewUrl: "", wheretowatch: "", publicEnabled: false,
  images: [], parentId: "", season: "", episode: "", chapter: "",
};

const emptyTrackForm: TrackForm = {
  name: "", narratedLanguage: "en", narrator: "",
  trackUrl: "", trackPosition: "1", publicEnabled: true,
  releaseDate: "", magic_adjust: "",
};

export function TrackEditorPage() {
  const { editorState, titleId } = useParams();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const isNew = editorState === "new";
  const isEdit = editorState === "edit";

  const [titleForm, setTitleForm] = useState<TitleForm>(emptyTitleForm);
  const [initialTitleForm, setInitialTitleForm] = useState<TitleForm>(emptyTitleForm);
  const [tracks, setTracks] = useState<ShazacinMetadataAdTrack[]>([]);
  const [tracksLoading, setTracksLoading] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Poster state
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterRemoved, setPosterRemoved] = useState(false);
  const posterInputRef = useRef<HTMLInputElement>(null);

  // Original audio state
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioProcessedUrl, setAudioProcessedUrl] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioRemoved, setAudioRemoved] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [audioLoading, setAudioLoading] = useState(false);

  // AD track audio state (for modal)
  const [adTrackAudioFile, setAdTrackAudioFile] = useState<File | null>(null);
  const adTrackAudioInputRef = useRef<HTMLInputElement>(null);

  // Revoke previous blob URLs when preview URLs change or on unmount
  useEffect(() => {
    return () => {
      if (posterPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(posterPreviewUrl);
      }
    };
  }, [posterPreviewUrl]);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
    };
  }, [audioPreviewUrl]);

  // Existing track audio URLs
  const [trackAudioUrls, setTrackAudioUrls] = useState<Record<string, string>>({});
  const [trackAudioChecked, setTrackAudioChecked] = useState<Set<string>>(new Set());

  // Track modal
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackForm, setTrackForm] = useState<TrackForm>(emptyTrackForm);
  const [trackSubmitting, setTrackSubmitting] = useState(false);
  const [deleteTrackTarget, setDeleteTrackTarget] = useState<Record<string, unknown> | null>(null);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);

  // Save confirmation dialog
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Chips suggestions state (loaded once from all titles)
  const [existingDirectors, setExistingDirectors] = useState<string[]>([]);
  const [existingWriters, setExistingWriters] = useState<string[]>([]);
  const [existingActors, setExistingActors] = useState<string[]>([]);
  const [existingCategories, setExistingCategories] = useState<string[]>([]);

  // Parent title options (for episode/chapter subtype)
  const [seriesOptions, setSeriesOptions] = useState<{ value: string; label: string }[]>([]);
  const [bookOptions, setBookOptions] = useState<{ value: string; label: string }[]>([]);

  // Load suggestions and parent options on mount
  useEffect(() => {
    loadAllSuggestions();
    loadParentOptions();
  }, []);

  // Dirty form check for unsaved changes warning
  const isDirty = JSON.stringify(titleForm) !== JSON.stringify(initialTitleForm) || !!posterFile || !!audioFile || posterRemoved || audioRemoved;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const loadAllSuggestions = async () => {
    try {
      const res = await graphqlQuery<{ listShazacinMetadataTitles: ListResponse<ShazacinMetadataTitle> }>(
        listShazacinMetadataTitles,
        { limit: 200 }
      );
      const items = res.listShazacinMetadataTitles.items ?? [];
      const directors = new Set<string>();
      const writers = new Set<string>();
      const actors = new Set<string>();
      const categories = new Set<string>();
      for (const t of items) {
        (t.directors ?? []).forEach((d) => directors.add(d));
        (t.writers ?? []).forEach((w) => writers.add(w));
        (t.actors ?? []).forEach((a) => actors.add(a));
        (t.categories ?? []).forEach((c) => categories.add(c));
      }
      setExistingDirectors(Array.from(directors).sort());
      setExistingWriters(Array.from(writers).sort());
      setExistingActors(Array.from(actors).sort());
      setExistingCategories(Array.from(categories).sort());
    } catch {
      // silently fail — suggestions just won't be available
    }
  };

  const loadParentOptions = async () => {
    try {
      // Load series options
      const seriesRes = await graphqlQuery<{ listShazacinMetadataTitles: ListResponse<ShazacinMetadataTitle> }>(
        listShazacinMetadataTitles,
        { filter: { type: { eq: "series" } }, limit: 200 }
      );
      const seriesItems = seriesRes.listShazacinMetadataTitles.items ?? [];
      setSeriesOptions(seriesItems.map((s) => ({ value: s.titleId, label: s.title })));

      // Load book options
      const bookRes = await graphqlQuery<{ listShazacinMetadataTitles: ListResponse<ShazacinMetadataTitle> }>(
        listShazacinMetadataTitles,
        { filter: { type: { eq: "book" } }, limit: 200 }
      );
      const bookItems = bookRes.listShazacinMetadataTitles.items ?? [];
      setBookOptions(bookItems.map((b) => ({ value: b.titleId, label: b.title })));
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    if (isEdit && titleId) {
      loadTitle(titleId);
      loadTracks(titleId);
    }
  }, [isEdit, titleId]);

  const checkExistingTrackAudio = useCallback(async (tid: string, trackList: ShazacinMetadataAdTrack[]) => {
    const newUrls: Record<string, string> = {};
    const newChecked = new Set<string>();
    for (const track of trackList) {
      if (track.trackId) {
        try {
          // Use direct public S3 URL (same approach as old admin app, bucket is public for adtracks)
          const url = appConfig.adTrackAudioUrl(tid, track.trackId);
          const resp = await fetch(url, { method: "HEAD" });
          if (resp.ok) {
            newUrls[track.trackId] = url;
          }
        } catch {
          // Fallback: try Amplify getUrl with proper bucket config (signed URL, bypasses CORS)
          try {
            const path = appConfig.paths.adTrackPath(tid, track.trackId);
            const { url: signedUrl } = await getUrl({
              path,
              options: { bucket: { bucketName: appConfig.buckets.staticContent, region: appConfig.region } },
            });
            newUrls[track.trackId] = signedUrl.toString();
          } catch {
            // no audio available — file doesn't exist in S3
          }
        }
        newChecked.add(track.trackId);
      }
    }
    setTrackAudioUrls((prev) => ({ ...prev, ...newUrls }));
    setTrackAudioChecked((prev) => new Set([...prev, ...newChecked]));
  }, []);

  const loadTitle = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await graphqlQuery<{ getShazacinMetadataTitle: ShazacinMetadataTitle }>(
        getShazacinMetadataTitle,
        { titleId: id }
      );
      const t = res.getShazacinMetadataTitle;
      if (!t) {
        setError("Title not found");
        return;
      }

      let images: string[] = [];
      if (t.images) {
        if (Array.isArray(t.images)) {
          images = t.images;
        } else if (typeof t.images === "string" && t.images.length > 0) {
          images = (t.images as string).split(",").map((s: string) => s.trim()).filter(Boolean);
        }
      }

      setTitleForm({
        title: t.title ?? "",
        type: t.type ?? "movie",
        categories: (t.categories ?? []).join(", "),
        actors: (t.actors ?? []).join(", "),
        directors: (t.directors ?? []).join(", "),
        writers: (t.writers ?? []).join(", "),
        genre: t.genre ?? "",
        synopsis: t.synopsis ?? "",
        year: t.year?.toString() ?? "",
        released: t.released ?? "",
        rated: t.rated ?? "PG",
        runtimeMinutes: t.runtimeMinutes?.toString() ?? "",
        score: t.score?.toString() ?? "",
        previewUrl: t.previewUrl ?? "",
        wheretowatch: t.wheretowatch ?? "",
        publicEnabled: t.publicEnabled ?? false,
        images,
        parentId: t.parentId ?? "",
        season: t.season ?? "",
        episode: t.episode ?? "",
        chapter: t.chapter ?? "",
      });

      setInitialTitleForm({
        title: t.title ?? "",
        type: t.type ?? "movie",
        categories: (t.categories ?? []).join(", "),
        actors: (t.actors ?? []).join(", "),
        directors: (t.directors ?? []).join(", "),
        writers: (t.writers ?? []).join(", "),
        genre: t.genre ?? "",
        synopsis: t.synopsis ?? "",
        year: t.year?.toString() ?? "",
        released: t.released ?? "",
        rated: t.rated ?? "PG",
        runtimeMinutes: t.runtimeMinutes?.toString() ?? "",
        score: t.score?.toString() ?? "",
        previewUrl: t.previewUrl ?? "",
        wheretowatch: t.wheretowatch ?? "",
        publicEnabled: t.publicEnabled ?? false,
        images,
        parentId: t.parentId ?? "",
        season: t.season ?? "",
        episode: t.episode ?? "",
        chapter: t.chapter ?? "",
      });

      // Load existing poster
      if (images.length > 0 && images[0]) {
        const posterUrl = appConfig.posterUrl(images[0]);
        setPosterPreviewUrl(posterUrl);
      }

      // Try to load processed audio via signed URL
      try {
        setAudioLoading(true);
        const link = await getUrl({
          path: appConfig.paths.audioProcessed(id),
          options: {
            bucket: { bucketName: appConfig.buckets.audioProcessing, region: appConfig.region },
          },
        });
        setAudioProcessedUrl(link.url.toString());
      } catch {
        // Audio may not exist yet — that's fine
      } finally {
        setAudioLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load title");
    } finally {
      setLoading(false);
    }
  };

  const loadTracks = async (id: string) => {
    try {
      setTracksLoading(true);
      const res = await graphqlQuery<{ listShazacinMetadataAdTracks: ListResponse<ShazacinMetadataAdTrack> }>(
        listShazacinMetadataAdTracks,
        { filter: { titleId: { eq: id } } }
      );
      const trackList = res.listShazacinMetadataAdTracks.items ?? [];
      // Sort by trackPosition (same as old admin app)
      trackList.sort((a, b) => {
        const aPos = a.trackPosition ?? Number.MAX_SAFE_INTEGER;
        const bPos = b.trackPosition ?? Number.MAX_SAFE_INTEGER;
        return aPos - bPos;
      });
      setTracks(trackList);
      checkExistingTrackAudio(id, trackList);
    } catch {
      // silently fail — tracks section shows empty
    } finally {
      setTracksLoading(false);
    }
  };

  // Poster file handlers
  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validImageTypes = mimeTypeExtensionMapping.images.map((m) => m.mimeType);
    if (!validImageTypes.includes(file.type)) {
      addToast({ type: "error", message: `Invalid image type. Accepted: ${validImageTypes.join(", ")}` });
      return;
    }

    setPosterFile(file);
    setPosterRemoved(false);
    const blobUrl = URL.createObjectURL(file);
    setPosterPreviewUrl(blobUrl);
    e.target.value = "";
  };

  const handleRemovePoster = () => {
    setPosterFile(null);
    setPosterPreviewUrl(null);
    setPosterRemoved(true);
    if (posterInputRef.current) posterInputRef.current.value = "";
  };

  // IMDB search handler
  const handleIMDBSelect = useCallback(
    async (metadata: IMDBMetadata) => {
      setTitleForm((f) => ({
        ...f,
        title: metadata.title || f.title,
        year: metadata.year || f.year,
        rated: metadata.rated || f.rated,
        released: metadata.released || f.released,
        runtimeMinutes: metadata.runtimeMinutes || f.runtimeMinutes,
        genre: metadata.genre || f.genre,
        categories: metadata.categories.join(", ") || f.categories,
        directors: metadata.directors.join(", ") || f.directors,
        writers: metadata.writers.join(", ") || f.writers,
        actors: metadata.actors.join(", ") || f.actors,
        score: metadata.score || f.score,
        synopsis: metadata.synopsis || f.synopsis,
      }));

      if (metadata.posterUrl) {
        try {
          addToast({ type: "info", message: "Downloading poster from IMDB..." });
          const resp = await fetch(metadata.posterUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            const ext = mimeTypeExtensionMapping.images.find(
              (m) => m.mimeType === blob.type
            )?.extension ?? ".jpg";
            const file = new File([blob], `imdb_poster${ext}`, { type: blob.type || "image/jpeg" });
            setPosterFile(file);
            setPosterRemoved(false);
            const blobUrl = URL.createObjectURL(file);
            setPosterPreviewUrl(blobUrl);
            addToast({ type: "success", message: "Poster loaded from IMDB" });
          } else {
            addToast({ type: "error", message: "Failed to download IMDB poster" });
          }
        } catch {
          addToast({ type: "error", message: "Failed to download IMDB poster" });
        }
      }

      addToast({ type: "success", message: "IMDB metadata applied" });
    },
    [addToast]
  );

  // Audio file handlers
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "audio/mpeg") {
      addToast({ type: "error", message: "Only .mp3 audio files are accepted" });
      return;
    }

    setAudioFile(file);
    setAudioRemoved(false);
    const blobUrl = URL.createObjectURL(file);
    setAudioPreviewUrl(blobUrl);
    e.target.value = "";
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    setAudioPreviewUrl(null);
    setAudioRemoved(true);
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  // AD track audio file handler
  const handleAdTrackAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = mimeTypeExtensionMapping.adTrackAudio.map((m) => m.mimeType);
    if (!validTypes.includes(file.type)) {
      addToast({ type: "error", message: `Invalid audio type. Accepted: ${validTypes.join(", ")}` });
      return;
    }

    setAdTrackAudioFile(file);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!titleForm.title.trim()) {
      addToast({ type: "error", message: "Title is required" });
      return;
    }
    setSaving(true);
    try {
      const input: Record<string, unknown> = {
        title: titleForm.title.trim(),
        type: titleForm.type,
        categories: titleForm.categories.split(",").map((s) => s.trim()).filter(Boolean),
        actors: titleForm.actors.split(",").map((s) => s.trim()).filter(Boolean),
        directors: titleForm.directors.split(",").map((s) => s.trim()).filter(Boolean),
        writers: titleForm.writers.split(",").map((s) => s.trim()).filter(Boolean),
        genre: titleForm.genre.trim() || undefined,
        synopsis: titleForm.synopsis.trim() || undefined,
        year: titleForm.year ? parseInt(titleForm.year, 10) : undefined,
        released: titleForm.released.trim() || undefined,
        rated: titleForm.rated.trim() || undefined,
        runtimeMinutes: titleForm.runtimeMinutes ? parseInt(titleForm.runtimeMinutes, 10) : undefined,
        score: titleForm.score ? parseFloat(titleForm.score) : undefined,
        previewUrl: titleForm.previewUrl.trim() || undefined,
        wheretowatch: titleForm.wheretowatch.trim() || undefined,
        publicEnabled: titleForm.publicEnabled,
        parentId: titleForm.parentId.trim() || undefined,
        season: titleForm.season.trim() || undefined,
        episode: titleForm.episode.trim() || undefined,
        chapter: titleForm.chapter.trim() || undefined,
      };

      // Handle poster upload
      if (posterRemoved) {
        input.images = [];
      } else if (posterFile) {
        const timestamp = Date.now();
        const ext = mimeTypeExtensionMapping.images.find((m) => m.mimeType === posterFile.type)?.extension ?? ".jpg";
        const s3Path = appConfig.paths.poster(timestamp, titleForm.title.trim(), ext);
        const uploadResult = uploadData({
          path: s3Path,
          data: posterFile,
          options: {
            bucket: { bucketName: appConfig.buckets.staticContent, region: appConfig.region },
          },
        });
        await uploadResult.result;
        input.images = [s3Path];
        addToast({ type: "success", message: "Poster uploaded to S3" });
      }

      if (isEdit && titleId) {
        input.titleId = titleId;

        // Upload original audio if a new file was selected
        if (audioFile) {
          const ext = ".mp3";
          const s3Path = appConfig.paths.audioUpload(titleId, ext);
          const uploadResult = uploadData({
            path: s3Path,
            data: audioFile,
            options: {
              bucket: { bucketName: appConfig.buckets.audioProcessing, region: appConfig.region },
            },
          });
          await uploadResult.result;
          addToast({ type: "success", message: "Original audio uploaded to S3" });
        }

        await graphqlMutation(updateShazacinMetadataTitles, { input });
        addToast({ type: "success", message: "Title updated" });
      } else {
        const createResult = await graphqlMutation<{ createShazacinMetadataTitles: ShazacinMetadataTitle }>(
          createShazacinMetadataTitles,
          { input }
        );

        // Upload original audio for newly created title
        const newTitleId = createResult?.createShazacinMetadataTitles?.titleId;
        if (audioFile && newTitleId) {
          const ext = ".mp3";
          const s3Path = appConfig.paths.audioUpload(newTitleId, ext);
          const uploadResult = uploadData({
            path: s3Path,
            data: audioFile,
            options: {
              bucket: { bucketName: appConfig.buckets.audioProcessing, region: appConfig.region },
            },
          });
          await uploadResult.result;
          addToast({ type: "success", message: "Original audio uploaded to S3" });
        }

        addToast({ type: "success", message: "Title created" });
        navigate("/titleManagement", { replace: true });
      }
      setLastSaved(new Date().toLocaleTimeString("en-GB"));
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save title",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTrack = async () => {
    if (!trackForm.name.trim() || !titleId) {
      addToast({ type: "error", message: "Track name and title ID are required" });
      return;
    }
    setTrackSubmitting(true);
    try {
      const input: Record<string, unknown> = {
        titleId,
        name: trackForm.name.trim(),
        narratedLanguage: trackForm.narratedLanguage,
        narrator: trackForm.narrator.trim() || undefined,
        trackUrl: trackForm.trackUrl.trim() || undefined,
        trackPosition: trackForm.trackPosition ? parseInt(trackForm.trackPosition, 10) : undefined,
        publicEnabled: trackForm.publicEnabled,
        releaseDate: trackForm.releaseDate.trim() || undefined,
        magic_adjust: trackForm.magic_adjust ? parseFloat(trackForm.magic_adjust) : undefined,
      };

      if (editingTrackId) {
        // Update existing track
        input.trackId = editingTrackId;
        await graphqlMutation(updateShazacinMetadataAdTracks, { input });
        addToast({ type: "success", message: "Track updated" });
      } else {
        // Create new track
        const result = await graphqlMutation<{ createShazacinMetadataAdTracks: ShazacinMetadataAdTrack }>(
          createShazacinMetadataAdTracks,
          { input }
        );

        // Upload AD track audio if a file was selected
        const newTrackId = result?.createShazacinMetadataAdTracks?.trackId;
        if (adTrackAudioFile && newTrackId) {
          const ext = mimeTypeExtensionMapping.adTrackAudio.find((m) => m.mimeType === adTrackAudioFile.type)?.extension ?? ".mp3";
          const s3Path = appConfig.paths.adTrackUpload(titleId, newTrackId, ext);
          const uploadResult = uploadData({
            path: s3Path,
            data: adTrackAudioFile,
            options: {
              bucket: { bucketName: appConfig.buckets.staticContent, region: appConfig.region },
            },
          });
          await uploadResult.result;
          addToast({ type: "success", message: "AD track audio uploaded to S3" });
        }
        addToast({ type: "success", message: "Track added" });
      }
      setShowTrackModal(false);
      setTrackForm(emptyTrackForm);
      setAdTrackAudioFile(null);
      setEditingTrackId(null);
      if (titleId) loadTracks(titleId);
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to add track",
      });
    } finally {
      setTrackSubmitting(false);
    }
  };

  const handleDeleteTrack = async () => {
    if (!deleteTrackTarget) return;
    const deletedTrackId = deleteTrackTarget.trackId as string;
    try {
      await graphqlMutation(deleteShazacinMetadataAdTracks, {
        input: { trackId: deletedTrackId },
      });
      addToast({ type: "success", message: "Track deleted" });
      setDeleteTrackTarget(null);
      setTracks((prev) => prev.filter((t) => t.trackId !== deletedTrackId));
      // Clean up audio URL state for deleted track
      setTrackAudioUrls((prev) => {
        const next = { ...prev };
        delete next[deletedTrackId];
        return next;
      });
      setTrackAudioChecked((prev) => {
        const next = new Set(prev);
        next.delete(deletedTrackId);
        return next;
      });
    } catch (err) {
      addToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete track",
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="mb-2 text-red-400">{error}</p>
        <button
          onClick={() => navigate("/titleManagement")}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:outline-none"
        >
          Back to Title Management
        </button>
      </div>
    );
  }

  const showAudioSection = isFieldVisible(titleForm.type, "audio");
  const showAdTracks = getTypeConfig(titleForm.type)?.showAdTracks !== false;

  // Determine which audio URL to play
  const effectiveAudioUrl = audioPreviewUrl ?? (audioRemoved ? null : audioProcessedUrl);

  const trackColumns: import("@/components/ui/DataTable").Column[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "narratedLanguage", label: "Language", hideOnMobile: true },
    { key: "narrator", label: "Narrator", hideOnMobile: true },
    {
      key: "trackPosition",
      label: "Position",
      hideOnMobile: true,
      render: (row: Record<string, unknown>) => String(row.trackPosition ?? "") ?? "—",
    },
    {
      key: "audio",
      label: "Audio",
      hideOnMobile: true,
      render: (row: Record<string, unknown>) => {
        const tid = row.trackId as string;
        if (!tid || !trackAudioChecked.has(tid)) return <span className="text-xs text-slate-500">Checking...</span>;
        const url = trackAudioUrls[tid];
        if (!url) return <span className="text-xs text-slate-500">No audio</span>;
        return <AudioPlayer src={url} className="w-48" />;
      },
    },
    {
      key: "publicEnabled",
      label: "Status",
      render: (row: Record<string, unknown>) => (
        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
          row.publicEnabled
            ? "border-green-800 bg-green-950/50 text-green-400"
            : "border-amber-800 bg-amber-950/50 text-amber-400"
        }`}>
          {row.publicEnabled ? "Live" : "Draft"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const track = row as unknown as ShazacinMetadataAdTrack;
              setEditingTrackId(track.trackId);
              setTrackForm({
                name: track.name ?? "",
                narratedLanguage: track.narratedLanguage ?? "en",
                narrator: track.narrator ?? "",
                trackUrl: track.trackUrl ?? "",
                trackPosition: track.trackPosition?.toString() ?? "1",
                publicEnabled: track.publicEnabled ?? true,
                releaseDate: track.releaseDate ?? "",
                magic_adjust: track.magic_adjust?.toString() ?? "",
              });
              setShowTrackModal(true);
            }}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label={`Edit track ${row.name ?? row.trackId}`}
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTrackTarget(row); }}
            className="rounded-md p-1.5 text-red-400 transition-colors hover:bg-red-950/50 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={`Delete track ${row.name ?? row.trackId}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/titleManagement")}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
            aria-label="Back to title management"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">
              {isNew ? "Add Title" : `Edit: ${titleForm.title || "Untitled"}`}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {isNew ? "Create a new title with metadata." : "Edit title metadata and manage AD tracks."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-slate-500">Saved at {lastSaved}</span>
          )}
          <button
            onClick={() => setShowSaveConfirm(true)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* IMDB Search */}
      <IMDBSearch
        onSelect={handleIMDBSelect}
        visible={isNew && getTypeConfig(titleForm.type)?.showIMDB === true}
      />

      {/* Title Metadata Form */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-base font-medium text-slate-200">Title Metadata</h3>

        {/* Poster Upload Area */}
        {isFieldVisible(titleForm.type, "poster") && (
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-slate-300">Poster Image</p>
            {posterPreviewUrl ? (
              <div className="relative inline-block">
                <img
                  src={posterPreviewUrl}
                  alt="Poster preview"
                  className="h-48 w-36 rounded-lg border border-slate-700 object-cover"
                />
                <button
                  onClick={handleRemovePoster}
                  className="absolute -right-2 -top-2 rounded-full border border-slate-700 bg-slate-800 p-1 text-red-400 transition-colors hover:bg-red-950 hover:text-red-300 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                  aria-label="Remove poster"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => posterInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); posterInputRef.current?.click(); } }}
                className="flex h-36 w-36 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/50 transition-colors hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                role="button"
                tabIndex={0}
                aria-label="Upload poster image"
              >
                <Image size={24} className="mb-1 text-slate-500" />
                <span className="text-xs text-slate-500">No poster</span>
              </div>
            )}
            <div className="mt-2">
              <button
                onClick={() => posterInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:outline-none"
              >
                <Upload size={12} />
                {posterPreviewUrl ? "Change Poster" : "Upload Poster"}
              </button>
            </div>
            <input
              ref={posterInputRef}
              type="file"
              accept={mimeTypeExtensionMapping.images.map((m) => m.mimeType).join(",")}
              onChange={handlePosterSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Original Audio Upload Area */}
        {showAudioSection && (
          <div className="mb-6">
            <p className="mb-2 text-sm font-medium text-slate-300">Original Audio</p>
            {effectiveAudioUrl ? (
              <div className="space-y-2">
                <AudioPlayer src={effectiveAudioUrl} />
                <button
                  onClick={handleRemoveAudio}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-800/50 bg-red-950/30 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-950/50 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                >
                  <Trash2 size={12} />
                  Remove Audio
                </button>
              </div>
            ) : audioLoading ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 size={16} className="animate-spin" />
                <span>Checking for existing audio...</span>
              </div>
            ) : (
              <div
                onClick={() => audioInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); audioInputRef.current?.click(); } }}
                className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/50 transition-colors hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                role="button"
                tabIndex={0}
                aria-label="Upload original audio"
              >
                <Upload size={20} className="mb-1 text-slate-500" />
                <span className="text-xs text-slate-500">Upload .mp3</span>
              </div>
            )}
            {effectiveAudioUrl && (
              <div className="mt-2">
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                >
                  <Upload size={12} />
                  Replace Audio
                </button>
              </div>
            )}
            <input
              ref={audioInputRef}
              type="file"
              accept=".mp3,audio/mpeg"
              onChange={handleAudioSelect}
              className="hidden"
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Type selector - always visible */}
          <Select
            label="Type"
            options={typeOptions}
            value={titleForm.type}
            onChange={(e) => setTitleForm((f) => ({ ...f, type: e.target.value }))}
          />

          {/* Parent Series - visible for episode type */}
          {isFieldVisible(titleForm.type, "subTitleSeries") && (
            <Select
              label={isFieldRequired(titleForm.type, "subTitleSeries") ? "Parent Series *" : "Parent Series"}
              options={[{ value: "", label: "— Select series —" }, ...seriesOptions]}
              value={titleForm.parentId}
              onChange={(e) => setTitleForm((f) => ({ ...f, parentId: e.target.value }))}
            />
          )}

          {/* Parent Book - visible for chapter type */}
          {isFieldVisible(titleForm.type, "subTitleBook") && (
            <Select
              label={isFieldRequired(titleForm.type, "subTitleBook") ? "Parent Book *" : "Parent Book"}
              options={[{ value: "", label: "— Select book —" }, ...bookOptions]}
              value={titleForm.parentId}
              onChange={(e) => setTitleForm((f) => ({ ...f, parentId: e.target.value }))}
            />
          )}

          {/* Season - visible for episode type */}
          {isFieldVisible(titleForm.type, "season") && (
            <TextInput
              label={isFieldRequired(titleForm.type, "season") ? "Season *" : "Season"}
              type="number"
              value={titleForm.season}
              onChange={(e) => setTitleForm((f) => ({ ...f, season: e.target.value }))}
              placeholder="1"
            />
          )}

          {/* Episode - visible for episode type */}
          {isFieldVisible(titleForm.type, "episode") && (
            <TextInput
              label={isFieldRequired(titleForm.type, "episode") ? "Episode *" : "Episode"}
              type="number"
              value={titleForm.episode}
              onChange={(e) => setTitleForm((f) => ({ ...f, episode: e.target.value }))}
              placeholder="1"
            />
          )}

          {/* Chapter - visible for chapter type */}
          {isFieldVisible(titleForm.type, "chapter") && (
            <TextInput
              label={isFieldRequired(titleForm.type, "chapter") ? "Chapter *" : "Chapter"}
              type="number"
              value={titleForm.chapter}
              onChange={(e) => setTitleForm((f) => ({ ...f, chapter: e.target.value }))}
              placeholder="1"
            />
          )}

          {/* Title */}
          {isFieldVisible(titleForm.type, "title") && (
            <TextInput
              label={isFieldRequired(titleForm.type, "title") ? "Title *" : "Title"}
              value={titleForm.title}
              onChange={(e) => setTitleForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Movie, TV show, or book title"
              required={isFieldRequired(titleForm.type, "title")}
            />
          )}

          {/* Directors - ChipsInput */}
          {isFieldVisible(titleForm.type, "directors") && (
            <ChipsInput
              label={isFieldRequired(titleForm.type, "directors") ? "Directors *" : "Directors"}
              value={titleForm.directors}
              onChange={(val) => setTitleForm((f) => ({ ...f, directors: val }))}
              suggestions={existingDirectors}
              placeholder="Type director name..."
            />
          )}

          {/* Writers - ChipsInput */}
          {isFieldVisible(titleForm.type, "writers") && (
            <ChipsInput
              label={isFieldRequired(titleForm.type, "writers") ? "Writers *" : "Writers"}
              value={titleForm.writers}
              onChange={(val) => setTitleForm((f) => ({ ...f, writers: val }))}
              suggestions={existingWriters}
              placeholder="Type writer name..."
            />
          )}

          {/* Actors - ChipsInput */}
          {isFieldVisible(titleForm.type, "actors") && (
            <ChipsInput
              label={isFieldRequired(titleForm.type, "actors") ? "Actors *" : "Actors"}
              value={titleForm.actors}
              onChange={(val) => setTitleForm((f) => ({ ...f, actors: val }))}
              suggestions={existingActors}
              placeholder="Type actor name..."
            />
          )}

          {/* Runtime Minutes */}
          {isFieldVisible(titleForm.type, "runtimeMinutes") && (
            <TextInput
              label={isFieldRequired(titleForm.type, "runtimeMinutes") ? "Runtime (minutes) *" : "Runtime (minutes)"}
              type="number"
              value={titleForm.runtimeMinutes}
              onChange={(e) => setTitleForm((f) => ({ ...f, runtimeMinutes: e.target.value }))}
              placeholder="120"
            />
          )}

          {/* Released */}
          {isFieldVisible(titleForm.type, "released") && (
            <TextInput
              label={isFieldRequired(titleForm.type, "released") ? "Released *" : "Released"}
              value={titleForm.released}
              onChange={(e) => setTitleForm((f) => ({ ...f, released: e.target.value }))}
              placeholder="2024-01-15"
            />
          )}

          {/* Preview URL */}
          {isFieldVisible(titleForm.type, "previewUrl") && (
            <TextInput
              label={isFieldRequired(titleForm.type, "previewUrl") ? "Preview URL *" : "Preview URL"}
              value={titleForm.previewUrl}
              onChange={(e) => setTitleForm((f) => ({ ...f, previewUrl: e.target.value }))}
              placeholder="https://..."
            />
          )}

          {/* Where to Watch - ChipsInput */}
          {isFieldVisible(titleForm.type, "wheretowatch") && (
            <ChipsInput
              label={isFieldRequired(titleForm.type, "wheretowatch") ? "Where to Watch *" : "Where to Watch"}
              value={titleForm.wheretowatch}
              onChange={(val) => setTitleForm((f) => ({ ...f, wheretowatch: val }))}
              suggestions={wheretowatchSuggestions}
              placeholder="Type platform name..."
            />
          )}

          {/* Score */}
          {isFieldVisible(titleForm.type, "score") && (
            <TextInput
              label={isFieldRequired(titleForm.type, "score") ? "Score (0-10) *" : "Score (0-10)"}
              type="number"
              step="0.1"
              value={titleForm.score}
              onChange={(e) => setTitleForm((f) => ({ ...f, score: e.target.value }))}
              placeholder="8.5"
            />
          )}

          {/* Categories - ChipsInput */}
          {isFieldVisible(titleForm.type, "categories") && (
            <ChipsInput
              label={isFieldRequired(titleForm.type, "categories") ? "Categories *" : "Categories"}
              value={titleForm.categories}
              onChange={(val) => setTitleForm((f) => ({ ...f, categories: val }))}
              suggestions={existingCategories}
              placeholder="Type category..."
            />
          )}

          {/* Genre - ChipsInput */}
          {isFieldVisible(titleForm.type, "genre") && (
            <ChipsInput
              label={isFieldRequired(titleForm.type, "genre") ? "Genre *" : "Genre"}
              value={titleForm.genre}
              onChange={(val) => setTitleForm((f) => ({ ...f, genre: val }))}
              suggestions={movieGenres}
              placeholder="Type genre..."
            />
          )}

          {/* Year */}
          {isFieldVisible(titleForm.type, "year") && (
            <TextInput
              label={isFieldRequired(titleForm.type, "year") ? "Year *" : "Year"}
              type="number"
              value={titleForm.year}
              onChange={(e) => setTitleForm((f) => ({ ...f, year: e.target.value }))}
              placeholder="2024"
            />
          )}

          {/* Rated */}
          {isFieldVisible(titleForm.type, "rated") && (
            <TextInput
              label={isFieldRequired(titleForm.type, "rated") ? "Rated *" : "Rated"}
              value={titleForm.rated}
              onChange={(e) => setTitleForm((f) => ({ ...f, rated: e.target.value }))}
              placeholder="PG-13"
            />
          )}
        </div>

        {/* Synopsis */}
        {isFieldVisible(titleForm.type, "synopsis") && (
          <TextArea
            label={isFieldRequired(titleForm.type, "synopsis") ? "Synopsis *" : "Synopsis"}
            value={titleForm.synopsis}
            onChange={(e) => setTitleForm((f) => ({ ...f, synopsis: e.target.value }))}
            placeholder="Brief description of the title..."
            className="mt-4"
          />
        )}

        {/* Public Enabled */}
        {isFieldVisible(titleForm.type, "publicEnabled") && (
          <label className="mt-4 flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={titleForm.publicEnabled}
              onChange={(e) => setTitleForm((f) => ({ ...f, publicEnabled: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-slate-500"
            />
            Publicly enabled (visible to app users)
          </label>
        )}
      </section>

      {/* AD Track Management */}
      {showAdTracks && (
        <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium text-slate-200">AD Tracks</h3>
            {isEdit && titleId && (
              <button
                onClick={() => { setShowTrackModal(true); setEditingTrackId(null); setTrackForm(emptyTrackForm); setAdTrackAudioFile(null); }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-slate-200 transition-colors hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                aria-label="Add a new AD track"
              >
                <Plus size={14} />
                Add Track
              </button>
            )}
          </div>
          {isNew ? (
            <p className="text-sm text-slate-400 italic">Save the title first to add audio description tracks.</p>
          ) : (
            <DataTable
              columns={trackColumns}
              data={tracks as unknown as Record<string, unknown>[]}
              loading={tracksLoading}
              emptyMessage="No AD tracks for this title yet."
            />
          )}
        </section>
      )}

      {/* Bottom Save Button (reachable via keyboard tab after form fields) */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => navigate("/titleManagement")}
          className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Cancel
        </button>
        <button
          onClick={() => setShowSaveConfirm(true)}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-700 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Title"}
        </button>
      </div>

      {/* Add/Edit Track Modal */}
      <Modal
        isOpen={showTrackModal}
        onClose={() => { if (!trackSubmitting) { setShowTrackModal(false); setTrackForm(emptyTrackForm); setAdTrackAudioFile(null); setEditingTrackId(null); } }}
        title={editingTrackId ? "Edit AD Track" : "Add AD Track"}
        footer={
          <>
            <button
              onClick={() => { setShowTrackModal(false); setTrackForm(emptyTrackForm); setAdTrackAudioFile(null); setEditingTrackId(null); }}
              disabled={trackSubmitting}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-slate-500 focus:outline-none disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTrack}
              disabled={trackSubmitting}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-600 focus:ring-2 focus:ring-slate-500 focus:outline-none disabled:opacity-50"
            >
              {trackSubmitting ? (editingTrackId ? "Saving..." : "Adding...") : (editingTrackId ? "Save Changes" : "Add Track")}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <TextInput
            label="Track Name *"
            value={trackForm.name}
            onChange={(e) => setTrackForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="English AD Track"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Language"
              options={languageOptions}
              value={trackForm.narratedLanguage}
              onChange={(e) => setTrackForm((f) => ({ ...f, narratedLanguage: e.target.value }))}
            />
            <TextInput
              label="Narrator"
              value={trackForm.narrator}
              onChange={(e) => setTrackForm((f) => ({ ...f, narrator: e.target.value }))}
              placeholder="Narrator name"
            />
          </div>
          <TextInput
            label="Track URL"
            value={trackForm.trackUrl}
            onChange={(e) => setTrackForm((f) => ({ ...f, trackUrl: e.target.value }))}
            placeholder="https://..."
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Track Position"
              type="number"
              value={trackForm.trackPosition}
              onChange={(e) => setTrackForm((f) => ({ ...f, trackPosition: e.target.value }))}
              placeholder="1"
            />
            <TextInput
              label="Magic Adjust"
              type="number"
              step="0.01"
              value={trackForm.magic_adjust}
              onChange={(e) => setTrackForm((f) => ({ ...f, magic_adjust: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div>
            <label htmlFor="track-release-date" className="mb-1.5 block text-sm font-medium text-slate-300">
              Release Date
            </label>
            <input
              id="track-release-date"
              type="date"
              value={trackForm.releaseDate}
              onChange={(e) => setTrackForm((f) => ({ ...f, releaseDate: e.target.value }))}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={trackForm.publicEnabled}
              onChange={(e) => setTrackForm((f) => ({ ...f, publicEnabled: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-slate-500"
            />
            Publicly enabled
          </label>

          {/* AD Track Audio Upload */}
          <div>
            <p className="mb-2 text-sm font-medium text-slate-300">AD Track Audio</p>
            {adTrackAudioFile ? (
              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 p-2">
                <span className="flex-1 truncate text-sm text-slate-300">{adTrackAudioFile.name}</span>
                <button
                  onClick={() => setAdTrackAudioFile(null)}
                  className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400 focus:ring-2 focus:ring-slate-500 focus:outline-none"
                  aria-label="Remove audio file"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => adTrackAudioInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); adTrackAudioInputRef.current?.click(); } }}
                className="flex h-16 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-900/50 transition-colors hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
                role="button"
                tabIndex={0}
                aria-label="Upload AD track audio"
              >
                <Upload size={16} className="mb-1 text-slate-500" />
                <span className="text-xs text-slate-500">Upload audio (.wav, .mp3, .oga)</span>
              </div>
            )}
            <input
              ref={adTrackAudioInputRef}
              type="file"
              accept={mimeTypeExtensionMapping.adTrackAudio.map((m) => m.mimeType).join(",")}
              onChange={handleAdTrackAudioSelect}
              className="hidden"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Track Confirmation */}
      <ConfirmDialog
        isOpen={deleteTrackTarget !== null}
        onClose={() => setDeleteTrackTarget(null)}
        onConfirm={handleDeleteTrack}
        title="Delete Track"
        message={`Are you sure you want to delete the track "${deleteTrackTarget?.name ?? "Untitled"}"?`}
        confirmText="Delete"
        destructive
      />

      {/* Save Title Confirmation */}
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => { setShowSaveConfirm(false); handleSave(); }}
        title="Save Title"
        message={`You are about to save the following:\n• Name: ${titleForm.title || "Untitled"}\n• Type: ${titleForm.type}\n• Public Enabled: ${titleForm.publicEnabled ? "Yes" : "No"}\n• AD Tracks: ${tracks.length}`}
        confirmText="Save"
      />
    </div>
  );
}