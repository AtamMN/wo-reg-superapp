import { getAuth } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { db } from '@/lib/firebase';
import { redirect } from 'next/navigation';

export async function withServerAuth(allowedRoles) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) redirect('/login');

  const checkRole = async (email) => {
    const roles = ['sadmins', 'admins', 'users'];
    
    for (const role of roles) {
      const roleRef = ref(db, `accounts/${role}`);
      const snapshot = await get(roleRef);
      
      if (snapshot.exists()) {
        const roleData = snapshot.val();
        const userEntry = Object.values(roleData).find(
          u => u.email === email
        );
        
        if (userEntry && allowedRoles.includes(role.slice(0, -1))) {
          return true;
        }
      }
    }
    return false;
  };

  const hasAccess = await checkRole(user.email);
  if (!hasAccess) redirect('/unauthorized');
}