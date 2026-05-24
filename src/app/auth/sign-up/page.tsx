import { signUpAction } from "@/app/auth/actions";
import { AuthPageContent } from "@/components/auth/auth-page-content";

export default function SignUpPage() {
  return <AuthPageContent action={signUpAction} mode="sign-up" />;
}
