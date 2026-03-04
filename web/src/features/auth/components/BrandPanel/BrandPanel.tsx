import "./BrandPanel.scss";

export default function BrandPanel() {
  return (
    <aside className="brandPanel">
      <div className="brandPanel__logo">PetYard</div>
      <h1 className="brandPanel__title">
        반려 생활을 더 따뜻하게,
        동네에서 더 가깝게.
      </h1>
      <p className="brandPanel__subtitle">
        성장 기록부터 산책 매칭까지.
        멍냥마당에서 나와 반려동물을 위한 동네 네트워크를 만나보세요.
      </p>
      <div className="brandPanel__hero" aria-hidden="true">
        <div className="brandPanel__heroGlow" />
      </div>
    </aside>
  );
}
