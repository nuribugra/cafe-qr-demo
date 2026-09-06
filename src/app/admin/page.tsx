import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "Admin — The Copper Cup",
};

// Auth is enforced upstream by src/proxy.ts (redirects to /admin/login if
// there's no valid session), so this page can render directly.
export default function AdminPage() {
  return <AdminPanel />;
}
