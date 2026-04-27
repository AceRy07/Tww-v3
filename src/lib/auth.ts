import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function requireAdmin(): Promise<string> {
  const { userId, orgRole } = await auth();

  if (!userId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[auth/requireAdmin] No userId — redirecting to sign-in.');
    }
    redirect('/sign-in');
  }

  const user = await currentUser();
  const metadataRole = user?.privateMetadata?.role;
  const role = typeof metadataRole === 'string' ? metadataRole : undefined;

  const isOrgAdmin = orgRole === 'admin' || orgRole === 'org:admin';
  const isMetadataAdmin = role === 'admin';

  if (!isMetadataAdmin && !isOrgAdmin) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[auth/requireAdmin] Access denied — set privateMetadata.role="admin" in Clerk dashboard for this user.', {
        userId,
        metadataRole: role ?? null,
        orgRole: orgRole ?? null,
      });
    }
    redirect('/sign-in');
  }

  return userId;
}

export async function withAdmin<T>(action: () => Promise<T>): Promise<T> {
  await requireAdmin();
  return await action();
}