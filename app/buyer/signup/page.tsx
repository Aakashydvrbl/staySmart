import { AuthForm } from "@/components/auth-form";

export default function BuyerSignupPage() {
  return (
    <div className="px-4 py-12 sm:px-6">
      <AuthForm role="buyer" mode="signup" />
    </div>
  );
}
