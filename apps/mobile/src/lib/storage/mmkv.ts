import { MMKV } from 'react-native-mmkv';

export const mmkv = new MMKV({ id: 'modo-caverna' });

/**
 * Adapter compatível com a interface esperada por @supabase/supabase-js
 * (storage.getItem/setItem/removeItem).
 */
export const mmkvStorageAdapter = {
  getItem: (key: string): string | null => {
    const value = mmkv.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string): void => {
    mmkv.set(key, value);
  },
  removeItem: (key: string): void => {
    mmkv.delete(key);
  },
};
