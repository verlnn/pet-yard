import AuthForm from "@/components/auth/AuthForm";

interface LoginPageProps {
  searchParams?: {
    next?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return <AuthForm mode="login" nextPath={searchParams?.next ?? null} />;
}
