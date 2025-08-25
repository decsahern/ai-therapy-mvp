import TherapistHeader from './Header';

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TherapistHeader />
      <main style={{ flex: 1, maxWidth: 900, margin: '0 auto', width: '100%', padding: 16 }}>
        {children}
      </main>
    </div>
  );
}
