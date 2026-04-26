'use client';

import { useSession } from '@/lib/supabase/useSession';

export function SessionEmail() {
  const { user } = useSession();
  if (!user?.email) return null;
  return <p className="text-mute text-xs mt-2">{user.email}</p>;
}
