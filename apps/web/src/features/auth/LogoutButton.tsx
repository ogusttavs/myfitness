'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@ui/button';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    await getSupabaseBrowserClient().auth.signOut();
    router.replace('/login');
  };

  return (
    <Button variant="secondary" size="md" className="w-full" onClick={onClick} disabled={busy}>
      <LogOut className="size-4 mr-2" /> sair
    </Button>
  );
}
