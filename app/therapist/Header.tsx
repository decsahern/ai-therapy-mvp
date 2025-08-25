'use client';

import Link from 'next/link';

export default function TherapistHeader() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e5e5',
        position: 'sticky',
        top: 0,
        background: 'white',
        zIndex: 10
      }}
    >
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link href="/therapist/prompts">Prompts</Link>
        <Link href="/therapist/patient-prompt">Patient Prompt</Link>
        {/* Add more therapist tools here later */}
      </nav>

      <form action="/logout" method="post">
        <button
          type="submit"
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #ddd',
            background: '#fafafa',
            cursor: 'pointer'
          }}
        >
          Log out
        </button>
      </form>
    </header>
  );
}

