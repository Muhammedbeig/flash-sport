import type { ReactNode } from "react";
import AdminClientLayout from "@/components/admin/AdminClientLayout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
}
