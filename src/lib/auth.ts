import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function requireAdmin(): Promise<string> {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 [requireAdmin] Development bypass aktif');
    return 'dev-user-id';           // dev modunda sahte userId dön
  }

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const role = user?.privateMetadata?.role as string | undefined;

  if (role !== 'admin') {
    redirect('/sign-in');
  }

  return userId;
}

export async function withAdmin<T>(
  action: () => Promise<T>
): Promise<T> {
  // Merkezi admin kontrolü: tüm admin action'lar bu wrapper üzerinden yetkilendirilir.
  await requireAdmin();

  // Yetki geçerliyse gerçek action çalıştırılır.
  return await action();
}