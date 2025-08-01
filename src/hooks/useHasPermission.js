// src/hooks/useHasPermission.js
import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useHasPermission(code) {
  const { user } = useAuth();
  return useMemo(() => {
    if (!user) return false;
    // Собираем все коды прав из ролей
    const perms = user.roles?.flatMap(r => r.permissions.map(p => p.code)) || [];
    // либо конкретное право, либо глобальное read_all
    return perms.includes(code) || perms.includes('read_all');
  }, [user, code]);
}
