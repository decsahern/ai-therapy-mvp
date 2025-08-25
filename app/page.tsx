import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-xl mx-auto text-center space-y-8">
        <h1 className="text-3xl font-semibold">AI Therapy Assistant</h1>
        <p className="text-neutral-600">
          Choose your role to continue.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/patient/login"
            className="rounded-lg border border-neutral-300 px-6 py-4 hover:bg-neutral-50 text-lg"
          >
            I am a Patient
          </Link>

          <Link
            href="/therapist/login"
            className="rounded-lg border border-neutral-300 px-6 py-4 hover:bg-neutral-50 text-lg"
          >
            I am a Therapist
          </Link>
        </div>

        <div className="text-sm text-neutral-500">
          You’ll be asked to sign in or sign up.
        </div>
      </div>
    </main>
  );
}


