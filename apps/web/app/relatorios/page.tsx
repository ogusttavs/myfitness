import { AppShell } from '@/components/AppShell';
import { RelatoriosClient } from '@/features/relatorios/RelatoriosClient';

export default function RelatoriosPage() {
  return (
    <AppShell>
      <RelatoriosClient />
    </AppShell>
  );
}
