import { ProfileFeedPageClient } from "../my-feed/page";

interface UserProfilePageProps {
  params: Promise<{ username: string }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;
  return <ProfileFeedPageClient usernameParam={username} />;
}
