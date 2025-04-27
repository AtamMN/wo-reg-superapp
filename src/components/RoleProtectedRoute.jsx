'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push('/login');
      } else if (userRole && !allowedRoles.includes(userRole.role)) {
        router.push('/unauthorized');
      }
    }
  }, [currentUser, userRole, loading, allowedRoles, router]);

  if (loading || !currentUser || !userRole) return null;
  
  return allowedRoles.includes(userRole.role) ? children : null;
}