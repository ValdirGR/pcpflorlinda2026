"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-4 border-pink-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.nivel !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
