"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  UserPlus,
  MoreVertical,
  Shield,
  User,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleStatusUsuario, excluirUsuario } from "@/app/admin-actions";
import { formatDateTime } from "@/lib/utils";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  nivel: string;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

interface UserTableProps {
  usuarios: Usuario[];
}

const nivelIcons: Record<string, React.ElementType> = {
  admin: Shield,
  usuario: User,
  visualizador: Eye,
};

const nivelColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  usuario: "bg-blue-100 text-blue-700",
  visualizador: "bg-gray-100 text-gray-700",
};

const nivelLabels: Record<string, string> = {
  admin: "Admin",
  usuario: "Usuário",
  visualizador: "Visualizador",
};

export function UserTable({ usuarios }: UserTableProps) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [menuAberto, setMenuAberto] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtrados = usuarios.filter((u) => {
    const matchBusca =
      !busca ||
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase());
    const matchNivel = filtroNivel === "todos" || u.nivel === filtroNivel;
    const matchStatus =
      filtroStatus === "todos" ||
      (filtroStatus === "ativo" && u.ativo) ||
      (filtroStatus === "inativo" && !u.ativo);
    return matchBusca && matchNivel && matchStatus;
  });

  const handleToggleStatus = (id: number) => {
    startTransition(async () => {
      try {
        await toggleStatusUsuario(id);
        router.refresh();
      } catch (error: any) {
        alert(error.message);
      }
    });
    setMenuAberto(null);
  };

  const handleExcluir = (id: number, nome: string) => {
    if (confirm(`Tem certeza que deseja excluir o usuário "${nome}"? Esta ação não pode ser desfeita.`)) {
      startTransition(async () => {
        try {
          await excluirUsuario(id);
        } catch (error: any) {
          alert(error.message);
        }
      });
    }
    setMenuAberto(null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="pl-10 pr-4 py-2 w-full bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors"
            />
          </div>

          {/* Nível filter */}
          <select
            value={filtroNivel}
            onChange={(e) => setFiltroNivel(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
          >
            <option value="todos">Todos os níveis</option>
            <option value="admin">Admin</option>
            <option value="usuario">Usuário</option>
            <option value="visualizador">Visualizador</option>
          </select>

          {/* Status filter */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
          >
            <option value="todos">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>

        <Link
          href="/admin/usuarios/novo"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-indigo-600 transition-all shadow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Novo Usuário
        </Link>
      </div>

      {/* Contagem */}
      <p className="text-sm text-gray-500">
        {filtrados.length} usuário{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nível
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                filtrados.map((usuario) => {
                  const NivelIcon = nivelIcons[usuario.nivel] || User;
                  return (
                    <tr
                      key={usuario.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white",
                              usuario.ativo
                                ? "bg-gradient-to-br from-purple-400 to-indigo-500"
                                : "bg-gray-300"
                            )}
                          >
                            {usuario.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              href={`/admin/usuarios/${usuario.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors"
                            >
                              {usuario.nome}
                            </Link>
                            <p className="text-xs text-gray-500">
                              {usuario.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                            nivelColors[usuario.nivel] || "bg-gray-100 text-gray-700"
                          )}
                        >
                          <NivelIcon className="h-3 w-3" />
                          {nivelLabels[usuario.nivel] || usuario.nivel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                            usuario.ativo
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              usuario.ativo ? "bg-green-500" : "bg-red-500"
                            )}
                          />
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDateTime(usuario.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/usuarios/${usuario.id}`}
                            className="p-2 text-gray-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(usuario.id)}
                            disabled={isPending}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              usuario.ativo
                                ? "text-gray-400 hover:text-orange-600 hover:bg-orange-50"
                                : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                            )}
                            title={usuario.ativo ? "Desativar" : "Ativar"}
                          >
                            {usuario.ativo ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleExcluir(usuario.id, usuario.nome)}
                            disabled={isPending}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
