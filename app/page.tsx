// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-3xl font-bold">AI Therapy MVP</h1>
      <p className="text-lg text-gray-600">Choose your role to continue:</p>

      <div className="flex gap-4">
        <Link
          href="/therapist/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          I am a Therapist
        </Link>
        <Link
          href="/patient/login"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          I am a Patient
        </Link>
      </div>
    </main>
  );
}
