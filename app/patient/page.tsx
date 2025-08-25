import Link from "next/link";

export default function PatientDashboard() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Patient Dashboard</h1>

      <div className="grid gap-4">
        <Link href="/patient/chat" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium mb-1">Open Chat</div>
          <div className="text-sm text-gray-600">Continue your conversation.</div>
        </Link>

        <Link href="/logout" className="border rounded p-4 hover:bg-gray-50">
          <div className="font-medium mb-1">Log out</div>
          <div className="text-sm text-gray-600">End session.</div>
        </Link>
      </div>
    </main>
  );
}
