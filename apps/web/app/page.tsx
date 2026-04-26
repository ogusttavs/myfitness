import { AppShell } from '@/components/AppShell';
import { HojeClient } from '@/features/hoje/HojeClient';

export default function HojePage() {
  return (
    <AppShell>
      <HojeClient />
    </AppShell>
  );
}
