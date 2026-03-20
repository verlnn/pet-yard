import Image from "next/image";

export default function BrandPanel() {
  return (
    <aside className="auth-brand-panel">
      <div className="auth-brand-panel-body">
        <div className="auth-brand-panel-badge">
          <Image
            src="/images/brand/petyard-symbol.png"
            alt="멍냥마당 로고"
            width={22}
            height={22}
            className="h-5 w-5"
          />
          멍냥마당
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight">
          동네에서 가장
          <br />
          믿을 수 있는 반려 생활.
        </h1>
        <p className="auth-brand-panel-copy">
          성장 기록, 매칭, 커뮤니티를 한 번에. 멍냥마당에서 내 반려생활을
          더 단정하고 안전하게 시작하세요.
        </p>
      </div>
      <div className="auth-brand-panel-footer">
        <div className="auth-brand-panel-taglist">
          <span className="auth-brand-panel-tag">안심 매칭</span>
          <span className="auth-brand-panel-tag">산책 루틴</span>
          <span className="auth-brand-panel-tag">동네 케어</span>
        </div>
        <div className="auth-brand-panel-quote">
          “우리 아이의 하루를 기록하고, 안전한 이웃과 연결해요.”
        </div>
      </div>
    </aside>
  );
}
