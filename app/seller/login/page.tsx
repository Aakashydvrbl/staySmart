import { AuthForm } from "@/components/auth-form";

export default function SellerLoginPage() {
  return (
    <div className="px-4 py-12 sm:px-6">
      <AuthForm role="seller" mode="login" />
    </div>
  );
}
