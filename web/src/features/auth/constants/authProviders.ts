export type SocialProviderId = "google" | "apple" | "naver";

export interface SocialProviderConfig {
  id: SocialProviderId;
  label: string;
  ariaLabel: string;
  iconSrc: string;
  backgroundClass: string;
  foregroundClass: string;
}

export const SOCIAL_PROVIDERS: SocialProviderConfig[] = [
  {
    id: "google",
    label: "구글",
    ariaLabel: "구글로 로그인",
    iconSrc: "/images/auth/google-logo.png",
    backgroundClass: "bg-white",
    foregroundClass: "text-slate-700"
  },
  {
    id: "apple",
    label: "애플",
    ariaLabel: "애플로 로그인",
    // TODO: Apple Developer의 Sign in with Apple 로고/버튼 가이드에 맞는 파일로 교체
    iconSrc: "/images/auth/apple-logo.png",
    backgroundClass: "bg-black",
    foregroundClass: "text-white"
  },
  {
    id: "naver",
    label: "네이버",
    ariaLabel: "네이버로 로그인",
    iconSrc: "/images/auth/naver-logo.png",
    backgroundClass: "bg-[#03C75A]",
    foregroundClass: "text-white"
  }
];
