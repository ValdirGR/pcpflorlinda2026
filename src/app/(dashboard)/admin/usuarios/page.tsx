import { listarUsuarios } from "@/app/admin-actions";
import AdminGuard from "@/components/admin/admin-guard";
import { UserTable } from "@/components/admin/user-table";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const usuarios = await listarUsuarios();

  return (
    <AdminGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-500 mt-1">
              Gerencie as contas de usuário do sistema
            </p>
          </div>
        </div>

        {/* Table */}
        <UserTable usuarios={usuarios} />
      </div>
    </AdminGuard>
  );
}
