"use client";

import { useState } from "react";
import "./SignupForm.scss";

interface SignupFormProps {
  onSubmit: (email: string, password: string) => void;
  loading?: boolean;
}

export default function SignupForm({ onSubmit, loading }: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setError("이메일 형식을 확인해주세요.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }
    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setError(null);
    onSubmit(email.trim(), password);
  };

  return (
    <form className="signupForm" onSubmit={handleSubmit}>
      <label className="signupForm__field">
        <span className="signupForm__label">이메일</span>
        <input
          type="email"
          className="signupForm__input"
          aria-label="이메일"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@pet-yard.com"
          required
        />
      </label>
      <label className="signupForm__field">
        <span className="signupForm__label">비밀번호</span>
        <div className="signupForm__password">
          <input
            type={showPassword ? "text" : "password"}
            className="signupForm__input"
            aria-label="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="최소 8자"
            required
          />
          <button
            type="button"
            className="signupForm__toggle"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "숨기기" : "보기"}
          </button>
        </div>
      </label>
      <label className="signupForm__field">
        <span className="signupForm__label">비밀번호 확인</span>
        <input
          type={showPassword ? "text" : "password"}
          className="signupForm__input"
          aria-label="비밀번호 확인"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="비밀번호 확인"
          required
        />
      </label>
      {error && <p className="signupForm__error">{error}</p>}
      <button className="signupForm__submit" type="submit" disabled={loading}>
        {loading ? "가입 중..." : "회원가입"}
      </button>
    </form>
  );
}
