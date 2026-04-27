import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function requireAdmin(): Promise<string> {
  // Bypass'lari kesinlikle kapatiyoruz: development ortaminda bile auth kontrolu zorunlu.
  if (process.env.NODE_ENV === 'development') {
    console.warn('[auth/requireAdmin] Development mode detected; bypass disabled, strict auth enforced.');
  }

  const { userId, orgRole } = await auth();
  if (!userId) {
    // Signed-out istekleri net sekilde sign-in'e yonlendir.
    console.warn('[auth/requireAdmin] Unauthorized request: missing session userId.');
    redirect('/sign-in');
  }

  const user = await currentUser();
  const metadataRole = user?.privateMetadata?.role;
  const role = typeof metadataRole === 'string' ? metadataRole : undefined;

  // Role kontrolu: custom metadata role veya organization role ile admin yetkisi dogrulanir.
  const isOrgAdmin = orgRole === 'admin' || orgRole === 'org:admin';
  const isMetadataAdmin = role === 'admin';

  if (!isMetadataAdmin && !isOrgAdmin) {
    // Olası bypass denemelerini log'la ancak izin verme.
    console.warn('[auth/requireAdmin] Access denied: non-admin role.', {
      metadataRole: role ?? null,
      orgRole: orgRole ?? null,
    });
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