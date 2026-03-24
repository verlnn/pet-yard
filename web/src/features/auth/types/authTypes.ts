export type AuthMode = "login" | "signup" | "verify";
export type OAuthProvider = "kakao" | "google" | "apple" | "naver";

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignupResponse {
  email: string;
  username: string;
  expiresAt: string;
}

export interface VerificationExpiryResponse {
  expiresAt: string;
}

export interface OAuthStartResponse {
  authorizeUrl: string;
  state: string;
  expiresAt: string;
}

export interface OAuthCallbackResponse {
  status: "LOGIN" | "ONBOARDING";
  signupToken?: string | null;
  nextStep?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}

export interface SignupProgressResponse {
  step: string;
  expiresAt: string;
  hasPet: boolean;
  nickname?: string | null;
  username?: string | null;
  profileImageUrl?: string | null;
}

export interface SignupStepResponse {
  nextStep: string;
}

export interface SignupUsernameCheckResponse {
  username: string;
  available: boolean;
}

export interface SignupCompleteResponse {
  accessToken: string;
  refreshToken: string;
}

export interface TermsItem {
  code: string;
  version: number;
  title: string;
  mandatory: boolean;
  contentUrl?: string | null;
}

export interface TermsResponse {
  terms: TermsItem[];
}

export interface MeResponse {
  userId: number;
  tier: string;
  permissions: string[];
}

export interface PetProfile {
  id: number;
  name: string;
  species: string;
  breed?: string | null;
  birthDate?: string | null;
  ageGroup?: string | null;
  gender: string;
  neutered?: boolean | null;
  intro?: string | null;
  photoUrl?: string | null;
  weightKg?: number | null;
  vaccinationComplete?: boolean | null;
  walkSafetyChecked?: boolean | null;
}

export interface PetBreed {
  id: number;
  nameKo: string;
  nameEn?: string | null;
}

export interface PetRegistrationVerificationResponse {
  dogRegNo: string;
  rfidCd: string;
  name: string;
  birthDate?: string | null;
  gender: string;
  breed?: string | null;
  neutered?: boolean | null;
  orgName?: string | null;
  officeTel?: string | null;
  approvalStatus?: string | null;
  registeredAt?: string | null;
  approvedAt?: string | null;
}

export interface MyProfileResponse {
  userId: number;
  username: string;
  nickname: string;
  regionName?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  gender?: string | null;
  primaryPetId?: number | null;
  tier: string;
  joinedAt: string;
  lastLoginAt?: string | null;
  guardianRelationStatus: GuardianRelationStatus;
  guardianCount: number;
  petCount: number;
  pets: PetProfile[];
}

export interface PublicProfileResponse {
  userId: number;
  username: string;
  nickname: string;
  regionName?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
  primaryPetId?: number | null;
  guardianRelationStatus: GuardianRelationStatus;
  guardianCount: number;
  petCount: number;
  pets: PetProfile[];
}

export interface FeedPost {
  id: number;
  content?: string | null;
  thumbnailImageUrl?: string | null;
  imageUrls?: string[] | null;
  images?: FeedImageAsset[] | null;
  imageAspectRatioValue?: number | null;
  imageAspectRatio?: "original" | "1:1" | "4:5" | "16:9" | null;
  pawCount: number;
  pawedByMe: boolean;
  commentCount: number;
  createdAt: string;
  hashtags?: string[] | null;
}

export interface FeedImageAsset {
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  originalUrl?: string | null;
  width?: number | null;
  height?: number | null;
  aspectRatio?: number | null;
  aspectRatioCode?: "original" | "1:1" | "4:5" | "16:9" | null;
}

export interface HomeFeedPost extends FeedPost {
  authorId: number;
  authorUsername?: string | null;
  authorNickname: string;
  authorProfileImageUrl?: string | null;
  guardianRelationStatus: GuardianRelationStatus;
  guardianRegisteredByMe: boolean;
}

export interface HomeFeedCursor {
  createdAt: string;
  id: number;
}

export interface HomeFeedPage {
  items: HomeFeedPost[];
  nextCursor?: HomeFeedCursor | null;
  hasMore: boolean;
}

export interface FeedPostPawResponse {
  postId: number;
  pawCount: number;
  pawedByMe: boolean;
}

export interface FeedPostComment {
  id: number;
  postId: number;
  parentCommentId?: number | null;
  content: string;
  createdAt: string;
  authorId: number;
  authorUsername?: string | null;
  authorNickname: string;
  authorProfileImageUrl?: string | null;
  authorPrimaryPetImageUrl?: string | null;
  replyToUsername?: string | null;
  authoredByMe: boolean;
  pawCount: number;
  pawedByMe: boolean;
}

export type GuardianRelationStatus =
  | "NONE"
  | "OUTGOING_REQUESTED"
  | "INCOMING_REQUESTED"
  | "CONNECTED";

export interface GuardianRegistrationResponse {
  targetUserId: number;
  guardianRelationStatus: GuardianRelationStatus;
  guardianRegisteredByMe: boolean;
}

export interface GuardianSummary {
  userId: number;
  username: string;
  nickname: string;
  profileImageUrl?: string | null;
}

export interface PublicGuardiansResponse {
  guardians: GuardianSummary[];
}

export type UserNotificationType =
  | "GUARDIAN_REQUEST"
  | "GUARDIAN_REQUEST_ACCEPTED"
  | "COMMENT_ON_POST"
  | "COMMENT_REPLY"
  | "PAW_ON_POST"
  | "PAW_ON_COMMENT";

export type UserNotificationStatus =
  | "UNREAD"
  | "READ"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELED";

export interface UserNotification {
  id: number;
  type: UserNotificationType;
  status: UserNotificationStatus;
  actorUserId: number;
  actorUsername?: string | null;
  actorNickname: string;
  actorProfileImageUrl?: string | null;
  message: string;
  createdAt: string;
  actionable: boolean;
  primaryActionLabel?: string | null;
  secondaryActionLabel?: string | null;
}

export interface UserNotificationActionResponse {
  notificationId: number;
  guardianRelationStatus: GuardianRelationStatus;
}

export interface UserNotificationUnreadCountResponse {
  unreadCount: number;
}
