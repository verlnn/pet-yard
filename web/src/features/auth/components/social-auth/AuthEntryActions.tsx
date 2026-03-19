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
    <div className="flex items-center justify-center gap-8">
      {SOCIAL_PROVIDERS.map((provider, index) => (
        <div key={provider.id} className="flex items-center gap-8">
          <SimpleSocialCircleButton
            label={provider.label}
            ariaLabel={provider.ariaLabel}
            onClick={providerHandlers[provider.id](props)}
            iconSrc={provider.iconSrc}
            disabled
          />
          {index < SOCIAL_PROVIDERS.length - 1 && (
            <span className="h-7 w-px rounded-full bg-black/20" aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}
