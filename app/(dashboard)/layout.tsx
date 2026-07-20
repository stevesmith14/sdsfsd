import { ReactNode } from "react";
import TopNav from "@/components/TopNav";
import ClientLayout from "@/components/ClientLayout";
import { LenisProvider } from "@/contexts/LenisContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LenisProvider>
      <ClientLayout>
        <div className="min-h-screen bg-bg-root flex flex-col">
          <TopNav />
          <main className="flex-1 w-full">
            {children}
          </main>
        </div>
      </ClientLayout>
    </LenisProvider>
  );
}
