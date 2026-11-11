import type { Metadata } from "next";
import { AdminView } from "@/components/admin/AdminView";

export const metadata: Metadata = {
  title: "Administration — NEWLAND ELECTRO",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminView />;
}
