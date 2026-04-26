import { AppShell } from '@/components/AppShell';
import { ProgressoClient } from '@/features/progress/ProgressoClient';

export default function ProgressoPage() {
  return (
    <AppShell>
      <ProgressoClient />
    </AppShell>
  );
}
