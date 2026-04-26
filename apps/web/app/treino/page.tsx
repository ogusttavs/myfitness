import { AppShell } from '@/components/AppShell';
import { TreinoClient } from '@/features/execution/TreinoClient';

export default function TreinoPage() {
  return (
    <AppShell>
      <TreinoClient />
    </AppShell>
  );
}
