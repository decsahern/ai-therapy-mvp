import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
      <h1 className="text-3xl font-bold">AI Therapy MVP</h1>
      <p className="text-gray-600">Choose your role to continue.</p>

      <div className="flex gap-4">
        <Link
          href="/patient/login?next=/patient"
          className="px-5 py-3 rounded bg-green-600 text-white"
        >
          I am a Patient
        </Link>

        <Link
          href="/therapist/login?next=/therapist"
          className="px-5 py-3 rounded bg-blue-600 text-white"
        >
          I am a Therapist
        </Link>
      </div>
    </main>
  );
}

