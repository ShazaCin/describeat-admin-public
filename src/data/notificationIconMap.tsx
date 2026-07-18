import {
  Film,
  Sparkles,
  Video,
  Music,
  Radio,
  Users,
  Globe,
  Library,
  MessageCircle,
  Smile,
  Info,
  Lightbulb,
  Heart,
  Theater,
  ShieldCheck,
  BellPlus,
  Tag,
  type LucideIcon,
} from "lucide-react";

/**
 * Maps notification icon names (Material-style keys from uiDataSets)
 * to their Lucide icon component equivalents.
 */
export const notificationIconMap: Record<string, LucideIcon> = {
  movie: Film,
  new_releases: Sparkles,
  featured_video: Video,
  note: Music,
  music_video: Music,
  radio: Radio,
  subscriptions: Users,
  web: Globe,
  video_library: Library,
  chat: MessageCircle,
  face: Smile,
  info: Info,
  lightbulb: Lightbulb,
  lightbulb_outline: Lightbulb,
  loyalty: Heart,
  theaters: Theater,
  verified: ShieldCheck,
  verified_user: ShieldCheck,
  add_alert: BellPlus,
  tag_faces: Tag,
};

/**
 * Returns the Lucide icon component for a given icon name,
 * or null if not found.
 */
export function getNotificationIcon(name: string): LucideIcon | null {
  return notificationIconMap[name] ?? null;
}