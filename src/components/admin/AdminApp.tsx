"use client";

import { PinGate } from "./PinGate";
import { AdminPanel } from "./AdminPanel";

export default function AdminApp() {
  return (
    <PinGate>
      <AdminPanel />
    </PinGate>
  );
}
