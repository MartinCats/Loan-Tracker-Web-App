import { signInAction } from "@/app/auth/actions";
import { AuthPageContent } from "@/components/auth/auth-page-content";
import { isPreviewMode } from "@/lib/preview";

type SignInPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next } = await searchParams;
  const previewMode = isPreviewMode();

  return (
    <AuthPageContent
      action={signInAction}
      mode="sign-in"
      next={next}
      previewMode={previewMode}
    />
  );
}
