import { EyeOff, Eye, UserCheck, Users, SearchX, Search } from "lucide-react";

interface PrivacyInfoSectionProps {
  isPrivate: boolean;
}

const privateItems = [
  { Icon: EyeOff, text: "게시물과 프로필은 집사 관계인 사용자에게만 공개됩니다." },
  { Icon: UserCheck, text: "새 집사요청은 내가 직접 수락해야 합니다." },
  { Icon: SearchX, text: "멍냥마당 검색에서 프로필 노출이 제한됩니다." },
] as const;

const publicItems = [
  { Icon: Eye, text: "모든 사용자가 게시물과 프로필을 자유롭게 볼 수 있습니다." },
  { Icon: Users, text: "집사요청 없이도 내 게시물에 발자국을 남길 수 있습니다." },
  { Icon: Search, text: "멍냥마당 검색에서 프로필이 노출됩니다." },
] as const;

export function PrivacyInfoSection({ isPrivate }: PrivacyInfoSectionProps) {
  const items = isPrivate ? privateItems : publicItems;

  return (
    <div className="privacy-info-section">
      <p className="privacy-info-section-title">
        {isPrivate ? "비공개 계정이 켜져 있을 때" : "공개 계정일 때"}
      </p>
      <ul className="privacy-info-list">
        {items.map(({ Icon, text }) => (
          <li key={text} className="privacy-info-item">
            <Icon
              className={`privacy-info-item-icon ${isPrivate ? "privacy-info-item-icon--private" : "privacy-info-item-icon--public"}`}
              aria-hidden="true"
            />
            <span className="privacy-info-item-text">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
