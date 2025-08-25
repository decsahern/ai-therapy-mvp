import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="max-w-md w-full flex flex-col gap-6 items-center">
        <h1 className="text-2xl font-semibold">AI Therapy MVP</h1>
        <p className="text-gray-600 text-center">
          Choose your role to continue.
        </p>
        <div className="flex gap-3">
          <Link
            href="/patient/login?next=/patient"
            className="px-4 py-2 rounded bg-green-600 text-white"
          >
            I am a patient
          </Link>
          <Link
            href="/therapist/login?next=/therapist"
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            I am a therapist
          </Link>
        </div>
      </div>
    </main>
  );
}

