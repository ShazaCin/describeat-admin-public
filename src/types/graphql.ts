export interface ShazacinMetadataTitle {
  titleId: string;
  title: string;
  type: string;
  categories?: string[];
  actors?: string[];
  directors?: string[];
  genre?: string;
  synopsis?: string;
  year?: number;
  released?: string;
  rated?: string;
  runtimeMinutes?: number;
  score?: number;
  previewUrl?: string;
  wheretowatch?: string;
  publicEnabled?: boolean;
  images?: string | string[];
  fingerprinting_progress?: string;
  parentId?: string;
  chapter?: string;
  episode?: string;
  season?: string;
  writers?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ShazacinMetadataAdTrack {
  trackId: string;
  titleId: string;
  name?: string;
  trackUrl?: string;
  trackPosition?: number;
  narratedLanguage?: string;
  narrator?: string;
  magic_adjust?: number;
  publicEnabled?: boolean;
  releaseDate?: string;
  createdAt?: string;
}

export interface ShazacinUserNotification {
  notificationId: string;
  userId?: string;
  adminId?: string;
  title?: string;
  heading?: string;
  message?: string;
  color?: string;
  icon?: string;
  imageUrl?: string;
  link?: string;
  read_time?: number;
  TTL?: number;
  createdAt?: string;
  sendPush?: boolean;
}

export interface ShazacinUserFeedback {
  feedbackId: string;
  message?: string;
  email?: string;
  rating?: number;
  titleId?: string;
  createdAt?: string;
}

export interface AdminUser {
  userId: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  userCreateDate?: string;
  userLastModifiedDate?: string;
  enabled?: boolean;
  userStatus?: string;
}

export interface ListResponse<T> {
  items: T[];
  nextToken: string | null;
}

export interface AdminUsersResponse {
  status: string;
  message: string;
  totalUsers: number;
  data: AdminUser[];
}
