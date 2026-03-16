"use client";

import SimpleSocialCircleButton from "./SimpleSocialCircleButton";
import { SOCIAL_PROVIDERS } from "@/src/features/auth/constants/authProviders";

interface AuthEntryActionsProps {
  onGoogleLogin: () => void;
  onNaverLogin: () => void;
  onAppleLogin: () => void;
}

const providerHandlers = {
  google: (props: AuthEntryActionsProps) => props.onGoogleLogin,
  apple: (props: AuthEntryActionsProps) => props.onAppleLogin,
  naver: (props: AuthEntryActionsProps) => props.onNaverLogin
} as const;

export default function AuthEntryActions(props: AuthEntryActionsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {SOCIAL_PROVIDERS.map((provider, index) => (
        <div key={provider.id} className="flex items-center gap-4">
          <SimpleSocialCircleButton
            label={provider.label}
            ariaLabel={provider.ariaLabel}
            onClick={providerHandlers[provider.id](props)}
            backgroundClass={provider.backgroundClass}
            foregroundClass={provider.foregroundClass}
            iconSizeClass={provider.iconSizeClass}
            iconSrc={provider.iconSrc}
            borderClass={provider.borderClass}
            hoverBackgroundClass={provider.hoverBackgroundClass}
            hoverBorderClass={provider.hoverBorderClass}
          />
          {index < SOCIAL_PROVIDERS.length - 1 && (
            <span className="h-6 w-px bg-slate-200" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}
