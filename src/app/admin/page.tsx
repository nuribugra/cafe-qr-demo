import type { Metadata } from "next";
import { AdminClientOnly } from "@/components/admin/AdminClientOnly";

export const metadata: Metadata = {
  title: "Admin — The Copper Cup",
};

export default function AdminPage() {
  return <AdminClientOnly />;
}
