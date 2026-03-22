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
    <div className="auth-social-provider-list">
      {SOCIAL_PROVIDERS.map((provider) => (
        <div key={provider.id} className="auth-social-provider-item">
          <SimpleSocialCircleButton
            label={provider.label}
            ariaLabel={provider.ariaLabel}
            onClick={providerHandlers[provider.id](props)}
            iconSrc={provider.iconSrc}
            disabled
          />
        </div>
      ))}
    </div>
  );
}
