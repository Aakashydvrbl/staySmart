import { AuthForm } from "@/components/auth-form";

export default function BuyerLoginPage() {
  return (
    <div className="px-4 py-12 sm:px-6">
      <AuthForm role="buyer" mode="login" />
    </div>
  );
}
