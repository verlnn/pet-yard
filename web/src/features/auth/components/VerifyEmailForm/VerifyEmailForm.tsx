"use client";

import { useState } from "react";
import "./VerifyEmailForm.scss";

interface VerifyEmailFormProps {
  onVerify: (code: string) => void;
  onResend: () => void;
  loading?: boolean;
}

export default function VerifyEmailForm({ onVerify, onResend, loading }: VerifyEmailFormProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (value: string) => {
    const onlyDigits = value.replace(/\D/g, "").slice(0, 6);
    setCode(onlyDigits);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length !== 6) {
      setError("6자리 인증 코드를 입력해주세요.");
      return;
    }
    setError(null);
    onVerify(code);
  };

  return (
    <form className="verifyForm" onSubmit={handleSubmit}>
      <label className="verifyForm__field">
        <span className="verifyForm__label">인증 코드</span>
        <input
          className="verifyForm__input"
          inputMode="numeric"
          aria-label="인증 코드"
          value={code}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="000000"
          required
        />
      </label>
      {error && <p className="verifyForm__error">{error}</p>}
      <button className="verifyForm__submit" type="submit" disabled={loading}>
        {loading ? "확인 중..." : "인증하기"}
      </button>
      <button className="verifyForm__resend" type="button" onClick={onResend} disabled={loading}>
        인증 코드 재전송
      </button>
    </form>
  );
}
