import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Navbar } from "@/components/home/navbar";

function SignInContent() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center p-4 pt-16">
        <SignInForm />
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}