"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Save,
  Eye,
  EyeOff,
  KeyRound,
  Shield,
  User,
  Clock,
  Mail,
} from "lucide-react";
import { editarUsuario, alterarSenhaUsuario } from "@/app/admin-actions";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/utils";

interface UsuarioData {
  id: number;
  nome: string;
  email: string;
  nivel: string;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export function EditarUsuarioForm({ usuario }: { usuario: UsuarioData }) {
  const [isPending, startTransition] = useTransition();
  const [isPendingSenha, startTransitionSenha] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [sucessoSenha, setSucessoSenha] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [senhaAberta, setSenhaAberta] = useState(false);

  const handleSubmit = (formData: FormData) => {
    setErro(null);

    if (!formData.get("nome") || !formData.get("email")) {
      setErro("Nome e email são obrigatórios");
      return;
    }

    startTransition(async () => {
      try {
        await editarUsuario(usuario.id, formData);
      } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) {
          throw error;
        }
        setErro(error.message || "Erro ao atualizar usuário");
      }
    });
  };

  const handleAlterarSenha = (formData: FormData) => {
    setErroSenha(null);
    setSucessoSenha(null);

    const novaSenha = formData.get("nova_senha") as string;
    const confirmar = formData.get("confirmar_senha") as string;

    if (!novaSenha || novaSenha.length < 6) {
      setErroSenha("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (novaSenha !== confirmar) {
      setErroSenha("As senhas não coincidem");
      return;
    }

    startTransitionSenha(async () => {
      try {
        const result = await alterarSenhaUsuario(usuario.id, formData);
        if (result.success) {
          setSucessoSenha(result.message);
          setSenhaAberta(false);
        }
      } catch (error: any) {
        setErroSenha(error.message || "Erro ao alterar senha");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold text-white",
              usuario.ativo
                ? "bg-gradient-to-br from-purple-400 to-indigo-500"
                : "bg-gray-300"
            )}
          >
            {usuario.nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">{usuario.nome}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {usuario.email}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Criado em {formatDateTime(usuario.created_at)}
              </span>
            </div>
          </div>
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              usuario.ativo ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}
          >
            {usuario.ativo ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>

      {/* Edit Form */}
      <form
        action={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-6"
      >
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <User className="h-5 w-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900">Dados do Usuário</h3>
        </div>

        {erro && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {erro}
          </div>
        )}

        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            required
            defaultValue={usuario.nome}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            defaultValue={usuario.email}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors"
          />
        </div>

        {/* Nível */}
        <div>
          <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
            Nível de Acesso
          </label>
          <select
            id="nivel"
            name="nivel"
            defaultValue={usuario.nivel}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors bg-white"
          >
            <option value="visualizador">Visualizador</option>
            <option value="usuario">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Admin: acesso total • Usuário: criar/editar • Visualizador: somente leitura
          </p>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="ativo" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="ativo"
            name="ativo"
            defaultValue={usuario.ativo ? "true" : "false"}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors bg-white"
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Link
            href="/admin/usuarios"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all shadow-sm",
              isPending
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
            )}
          >
            <Save className="h-4 w-4" />
            {isPending ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>

      {/* Alterar Senha */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Alterar Senha</h3>
          </div>
          <button
            type="button"
            onClick={() => setSenhaAberta(!senhaAberta)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            {senhaAberta ? "Fechar" : "Alterar"}
          </button>
        </div>

        {sucessoSenha && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            {sucessoSenha}
          </div>
        )}

        {senhaAberta && (
          <form action={handleAlterarSenha} className="mt-4 space-y-4">
            {erroSenha && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {erroSenha}
              </div>
            )}

            <div>
              <label htmlFor="nova_senha" className="block text-sm font-medium text-gray-700 mb-1">
                Nova Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  id="nova_senha"
                  name="nova_senha"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmar_senha_edit" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Nova Senha <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={mostrarConfirmar ? "text" : "password"}
                  id="confirmar_senha_edit"
                  name="confirmar_senha"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-colors"
                  placeholder="Repita a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPendingSenha}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all shadow-sm",
                  isPendingSenha
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                )}
              >
                <KeyRound className="h-4 w-4" />
                {isPendingSenha ? "Alterando..." : "Alterar Senha"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
