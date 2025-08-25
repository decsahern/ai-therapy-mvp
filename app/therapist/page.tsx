import Link from "next/link";

export default function TherapistDashboard() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Therapist Dashboard</h1>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link href="/therapist/patient-prompt" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium mb-1">Patient-specific Prompts</div>
          <div className="text-sm text-gray-600">Edit L3 prompts per patient.</div>
        </Link>

        <Link href="/therapist/prompts" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium mb-1">Global Prompting</div>
          <div className="text-sm text-gray-600">Adjust system & tone (L2).</div>
        </Link>

        <Link href="/api/debug/session" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium mb-1">Debug: Session</div>
          <div className="text-sm text-gray-600">Check who you’re signed in as.</div>
        </Link>

        <Link href="/logout" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium mb-1">Log out</div>
          <div className="text-sm text-gray-600">End session.</div>
        </Link>
      </div>
    </main>
  );
}
