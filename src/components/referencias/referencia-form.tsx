"use client";

import { FotoUpload } from "@/components/referencias/foto-upload";
import Link from "next/link";

interface Colecao {
    id: number;
    nome: string;
    codigo: string;
}

interface ReferenciaData {
    id?: number;
    colecao_id: number;
    codigo: string;
    nome: string;
    foto?: string | null;
    previsao_producao: number;
    tempo_producao: number;
    producao_diaria_pessoa: number;
    data_distribuicao?: string | null;
    media_dias_entrega?: number | null;
    localizacao_estoque?: string | null;
    status: string;
    para_marketing?: boolean;
    observacoes?: string | null;
}

interface ReferenciaFormProps {
    colecoes: Colecao[];
    referencia?: ReferenciaData | null;
    action: (formData: FormData) => Promise<void>;
    submitLabel: string;
    cancelHref: string;
}

function resolvePhotoUrl(foto: string | null | undefined): string | null {
    if (!foto) return null;
    if (foto.startsWith("http")) return foto;
    return `https://florlinda.store/pcpflorlinda/uploads/referencias/${foto}`;
}

export function ReferenciaForm({
    colecoes,
    referencia,
    action,
    submitLabel,
    cancelHref,
}: ReferenciaFormProps) {
    const fotoUrl = resolvePhotoUrl(referencia?.foto);

    return (
        <form
            action={action}
            className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Foto Upload */}
                <FotoUpload currentFoto={fotoUrl} />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Coleção *
                    </label>
                    <select
                        name="colecao_id"
                        required
                        defaultValue={referencia?.colecao_id || ""}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                    >
                        <option value="">Selecione...</option>
                        {colecoes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.nome} ({c.codigo})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Código *
                    </label>
                    <input
                        name="codigo"
                        required
                        defaultValue={referencia?.codigo || ""}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                        placeholder="Código da referência"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nome *
                    </label>
                    <input
                        name="nome"
                        required
                        defaultValue={referencia?.nome || ""}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                        placeholder="Nome da referência"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Previsão de Produção
                    </label>
                    <input
                        type="number"
                        name="previsao_producao"
                        defaultValue={referencia?.previsao_producao ?? ""}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                        placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Tempo de Produção (min)
                    </label>
                    <input
                        type="number"
                        name="tempo_producao"
                        defaultValue={referencia?.tempo_producao ?? ""}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                        placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Produção Diária/Pessoa
                    </label>
                    <input
                        type="number"
                        name="producao_diaria_pessoa"
                        defaultValue={referencia?.producao_diaria_pessoa ?? ""}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                        placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Data Distribuição
                    </label>
                    <input
                        type="date"
                        name="data_distribuicao"
                        defaultValue={referencia?.data_distribuicao || ""}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Média Dias Entrega
                    </label>
                    <input
                        type="number"
                        name="media_dias_entrega"
                        defaultValue={referencia?.media_dias_entrega ?? ""}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                        placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Localização Estoque
                    </label>
                    <input
                        name="localizacao_estoque"
                        defaultValue={referencia?.localizacao_estoque || ""}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                        placeholder="Local"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Status
                    </label>
                    <select
                        name="status"
                        defaultValue={referencia?.status || "normal"}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400"
                    >
                        <option value="normal">Normal</option>
                        <option value="finalizada">Finalizada</option>
                        <option value="arquivada">Arquivada</option>
                        <option value="atraso_desenvolvimento">Atraso Desenvolvimento</option>
                        <option value="atraso_logistica">Atraso Logística</option>
                        <option value="em_producao">Em Produção</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                    <input
                        type="checkbox"
                        name="para_marketing"
                        id="para_marketing"
                        defaultChecked={!!referencia?.para_marketing}
                        className="h-4 w-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                    />
                    <label htmlFor="para_marketing" className="text-sm text-gray-700">
                        Para Marketing
                    </label>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Observações
                    </label>
                    <textarea
                        name="observacoes"
                        rows={3}
                        defaultValue={referencia?.observacoes || ""}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 resize-none"
                        placeholder="Observações..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Link
                    href={cancelHref}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Cancelar
                </Link>
                <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-medium text-white bg-linear-to-r from-pink-500 to-rose-500 rounded-lg hover:from-pink-600 hover:to-rose-600 shadow-sm transition-all"
                >
                    {submitLabel}
                </button>
            </div>
        </form>
    );
}
