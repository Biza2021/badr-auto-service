import { AdminShell } from "@/components/admin-shell";
import { requireAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuthenticatedUser();
  return <AdminShell user={user}>{children}</AdminShell>;
}
