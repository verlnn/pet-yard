import type { OAuthCallbackResponse, OAuthProvider } from "../types/authTypes";

export interface OAuthPopupMessage {
  type: "oauth:success" | "oauth:error";
  provider: OAuthProvider;
  payload?: OAuthCallbackResponse;
  error?: string;
}

export interface OpenOAuthPopupOptions {
  authorizeUrl: string;
  provider: OAuthProvider;
  timeoutMs?: number;
}

export function openOAuthPopup({ authorizeUrl, provider, timeoutMs = 120_000 }: OpenOAuthPopupOptions) {
  return new Promise<OAuthCallbackResponse>((resolve, reject) => {
    const width = 480;
    const height = 680;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      authorizeUrl,
      `oauth_${provider}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      reject(new Error("팝업을 열 수 없습니다. 브라우저의 팝업 차단을 확인해 주세요."));
      return;
    }

    const origin = window.location.origin;
    const allowedOrigins = new Set([origin]);
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    if (apiBase) {
      try {
        allowedOrigins.add(new URL(apiBase).origin);
      } catch {
        // Ignore malformed API base in local overrides.
      }
    }

    const handleMessage = (event: MessageEvent<OAuthPopupMessage>) => {
      if (!allowedOrigins.has(event.origin)) return;
      if (!event.data || event.data.provider !== provider) return;

      if (event.data.type === "oauth:success" && event.data.payload) {
        cleanup();
        resolve(event.data.payload);
        return;
      }

      if (event.data.type === "oauth:error") {
        cleanup();
        reject(new Error(event.data.error ?? "소셜 로그인을 완료하지 못했습니다."));
      }
    };

    const handleClosePoll = window.setInterval(() => {
      if (popup.closed) {
        cleanup();
        reject(new Error("소셜 로그인을 취소했습니다."));
      }
    }, 500);

    const timeout = window.setTimeout(() => {
      cleanup();
      popup.close();
      reject(new Error("소셜 로그인 시간이 초과되었습니다."));
    }, timeoutMs);

    function cleanup() {
      window.removeEventListener("message", handleMessage);
      window.clearInterval(handleClosePoll);
      window.clearTimeout(timeout);
    }

    window.addEventListener("message", handleMessage);
  });
}

export function applyOAuthResult(result: OAuthCallbackResponse) {
  if (result.status === "LOGIN" && result.accessToken && result.refreshToken) {
    localStorage.setItem("accessToken", result.accessToken);
    localStorage.setItem("refreshToken", result.refreshToken);
    document.cookie = `accessToken=${result.accessToken}; path=/`;
    return { nextPath: "/feed" };
  }

  if (result.status === "ONBOARDING" && result.signupToken) {
    localStorage.setItem("signupToken", result.signupToken);
    return { nextPath: "/onboarding/profile" };
  }

  throw new Error("회원가입 상태를 확인할 수 없습니다. 다시 시도해 주세요.");
}
