import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#E0FF00] flex items-center justify-center p-4">
      <SignIn />
    </div>
  );
}
