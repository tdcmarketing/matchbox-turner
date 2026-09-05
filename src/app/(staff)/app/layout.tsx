import { Hydrated } from "@/components/Hydrated";
import { Shell } from "@/components/staff/Shell";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <Hydrated fallback={<div className="min-h-screen bg-paper-2" />}>
      <Shell>{children}</Shell>
    </Hydrated>
  );
}
