import { obterUsuario } from "@/app/admin-actions";
import AdminGuard from "@/components/admin/admin-guard";
import { EditarUsuarioForm } from "./form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await obterUsuario(parseInt(id));

  if (!usuario) {
    notFound();
  }

  return (
    <AdminGuard>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/usuarios"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Editar Usuário
            </h1>
            <p className="text-gray-500 mt-1">{usuario.nome}</p>
          </div>
        </div>

        <EditarUsuarioForm usuario={usuario} />
      </div>
    </AdminGuard>
  );
}
