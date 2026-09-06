"use client";

import dynamic from "next/dynamic";

// The admin panel reads sessionStorage for the PIN gate and always mutates
// live data, so there's no benefit to server-rendering it — load it
// client-only to keep things simple and avoid any hydration mismatch.
const AdminApp = dynamic(() => import("./AdminApp"), { ssr: false });

export function AdminClientOnly() {
  return <AdminApp />;
}
