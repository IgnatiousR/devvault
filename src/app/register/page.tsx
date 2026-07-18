import { RegisterForm } from "@/components/auth/register-form";
import { Navbar } from "@/components/home/navbar";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center p-4 pt-16">
        <RegisterForm />
      </div>
    </>
  );
}