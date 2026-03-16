export type SocialProviderId = "google" | "apple" | "naver";

export interface SocialProviderConfig {
  id: SocialProviderId;
  label: string;
  ariaLabel: string;
  iconSrc: string;
  iconSizeClass: string;
  backgroundClass: string;
  foregroundClass: string;
  borderClass: string;
  hoverBackgroundClass: string;
  hoverBorderClass: string;
}

export const SOCIAL_PROVIDERS: SocialProviderConfig[] = [
  {
    id: "google",
    label: "구글",
    ariaLabel: "구글로 로그인",
    iconSrc: "/images/auth/google-logo.png",
    iconSizeClass: "h-5 w-5",
    backgroundClass: "bg-white",
    foregroundClass: "text-slate-700",
    borderClass: "border-slate-200",
    hoverBackgroundClass: "hover:bg-white",
    hoverBorderClass: "hover:border-slate-300"
  },
  {
    id: "apple",
    label: "애플",
    ariaLabel: "애플로 로그인",
    // TODO: Apple Developer의 Sign in with Apple 로고/버튼 가이드에 맞는 파일로 교체
    iconSrc: "/images/auth/apple-logo.png",
    iconSizeClass: "",
    backgroundClass: "bg-transparent",
    foregroundClass: "text-slate-700",
    borderClass: "border-transparent",
    hoverBackgroundClass: "hover:bg-transparent",
    hoverBorderClass: "hover:border-transparent"
  },
  {
    id: "naver",
    label: "네이버",
    ariaLabel: "네이버로 로그인",
    iconSrc: "/images/auth/naver-logo.png",
    iconSizeClass: "",
    backgroundClass: "bg-transparent",
    foregroundClass: "text-slate-700",
    borderClass: "border-transparent",
    hoverBackgroundClass: "hover:bg-transparent",
    hoverBorderClass: "hover:border-transparent"
  }
];
