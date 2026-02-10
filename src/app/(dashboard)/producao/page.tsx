import prisma from "@/lib/prisma";
import Link from "next/link";
import { Plus, Eye, ArrowLeft, CheckCircle, Clock, Package, AlertTriangle, FileText } from "lucide-react";
import { formatDate, getStatusColor, getStatusLabel, calcPercentage } from "@/lib/utils";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

async function getProducaoData() {
  const now = new Date();
  const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Início da semana (segunda-feira)
  const dayOfWeek = now.getDay();
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - diffToMonday);
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 5); // sábado

  // Início e fim do mês
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [referencias, colecoes, producaoHoje, producaoSemana, producaoMes, ultimasAtualizacoes] =
    await Promise.all([
      // Todas as referências para estatísticas
      prisma.referencia.findMany({
        select: {
          id: true,
          codigo: true,
          nome: true,
          status: true,
          quantidade_produzida: true,
          previsao_producao: true,
          producao_diaria_pessoa: true,
          colecao: { select: { id: true, nome: true, codigo: true, data_fim: true } },
          etapas: {
            where: { status: { in: ["pendente", "em_andamento"] } },
            select: { data_fim: true },
          },
        },
      }),

      // Coleções com contagem de referências
      prisma.colecao.findMany({
        include: {
          _count: { select: { referencias: true } },
          referencias: {
            select: {
              quantidade_produzida: true,
              previsao_producao: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),

      // Produção de hoje
      prisma.producao.findMany({
        where: {
          data_producao: {
            gte: hoje,
            lt: new Date(hoje.getTime() + 86400000),
          },
        },
        select: { quantidade_dia: true },
      }),

      // Produção da semana
      prisma.producao.findMany({
        where: {
          data_producao: {
            gte: inicioSemana,
            lte: fimSemana,
          },
        },
        select: { quantidade_dia: true },
      }),

      // Produção do mês
      prisma.producao.findMany({
        where: {
          data_producao: {
            gte: inicioMes,
            lte: fimMes,
          },
        },
        select: { quantidade_dia: true },
      }),

      // Últimas atualizações de produção
      prisma.producao.findMany({
        include: {
          referencia: {
            select: {
              codigo: true,
              nome: true,
              colecao: { select: { nome: true } },
            },
          },
        },
        orderBy: { data_producao: "desc" },
        take: 10,
      }),
    ]);

  // Estatísticas das referências
  const totalReferencias = referencias.length;
  const refFinalizadas = referencias.filter((r) => r.status === "finalizada").length;
  const refEmProducao = referencias.filter((r) => r.status === "em_producao").length;
  const refAguardando = referencias.filter(
    (r) => r.status === "normal" && (r.quantidade_produzida || 0) > 0
  ).length;

  const metaDiaria = referencias.reduce((acc, r) => acc + (r.producao_diaria_pessoa || 0), 0);
  const metaSemanal = metaDiaria * 6;
  const metaMensal = metaDiaria * 26;

  const producaoHojeTotal = producaoHoje.reduce((acc, p) => acc + p.quantidade_dia, 0);
  const producaoSemanaTotal = producaoSemana.reduce((acc, p) => acc + p.quantidade_dia, 0);
  const producaoMesTotal = producaoMes.reduce((acc, p) => acc + p.quantidade_dia, 0);

  // Progresso por coleção
  const progressoColecoes = colecoes.map((c) => {
    const totalProd = c.referencias.reduce((acc, r) => acc + (r.quantidade_produzida || 0), 0);
    const totalPrev = c.referencias.reduce((acc, r) => acc + (r.previsao_producao || 0), 0);
    return {
      id: c.id,
      nome: c.nome,
      codigo: c.codigo,
      status: c.status || "normal",
      totalReferencias: c._count.referencias,
      produzidas: totalProd,
      previstas: totalPrev,
      percentual: totalPrev > 0 ? Math.round((totalProd / totalPrev) * 1000) / 10 : 0,
    };
  });

  // Referências com prazo crítico (etapas com data_fim vencida e não finalizadas)
  const refCriticas = referencias
    .filter(
      (r) =>
        r.status !== "finalizada" &&
        r.etapas.some((e) => e.data_fim && new Date(e.data_fim) < now)
    )
    .map((r) => ({
      id: r.id,
      codigo: r.codigo,
      nome: r.nome,
      colecao_nome: r.colecao.nome,
      quantidade_produzida: r.quantidade_produzida || 0,
      previsao_producao: r.previsao_producao || 0,
      data_fim_colecao: r.colecao.data_fim,
      diasRestantes: r.colecao.data_fim
        ? Math.ceil((new Date(r.colecao.data_fim).getTime() - now.getTime()) / 86400000)
        : null,
    }));

  return {
    stats: {
      totalReferencias,
      refFinalizadas,
      refEmProducao,
      refAguardando,
    },
    metas: {
      producaoHoje: producaoHojeTotal,
      metaDiaria,
      producaoSemana: producaoSemanaTotal,
      metaSemanal,
      producaoMes: producaoMesTotal,
      metaMensal,
    },
    progressoColecoes,
    ultimasAtualizacoes,
    refCriticas,
  };
}

export default async function ProducaoPage() {
  const session = await auth();
  const nivel = session?.user?.nivel || "visualizador";
  const data = await getProducaoData();

  const { stats, metas, progressoColecoes, ultimasAtualizacoes, refCriticas } = data;
  const pctFinalizadas =
    stats.totalReferencias > 0
      ? ((stats.refFinalizadas / stats.totalReferencias) * 100).toFixed(1)
      : "0.0";
  const pctEmProducao =
    stats.totalReferencias > 0
      ? ((stats.refEmProducao / stats.totalReferencias) * 100).toFixed(1)
      : "0.0";
  const pctAguardando =
    stats.totalReferencias > 0
      ? ((stats.refAguardando / stats.totalReferencias) * 100).toFixed(1)
      : "0.0";

  const pctDiario = metas.metaDiaria > 0 ? Math.min(100, (metas.producaoHoje / metas.metaDiaria) * 100) : 0;
  const pctSemanal = metas.metaSemanal > 0 ? Math.min(100, (metas.producaoSemana / metas.metaSemanal) * 100) : 0;
  const pctMensal = metas.metaMensal > 0 ? Math.min(100, (metas.producaoMes / metas.metaMensal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Produção</h2>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Dashboard
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total Referências</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalReferencias}</p>
          <p className="text-xs text-gray-400 mt-1">Em todo o sistema</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-5 shadow-sm">
          <p className="text-sm text-green-700 mb-1">Finalizadas</p>
          <p className="text-3xl font-bold text-green-800">{stats.refFinalizadas}</p>
          <p className="text-xs text-green-600 mt-1">{pctFinalizadas}% do total</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-100 p-5 shadow-sm">
          <p className="text-sm text-amber-700 mb-1">Em Produção</p>
          <p className="text-3xl font-bold text-amber-800">{stats.refEmProducao}</p>
          <p className="text-xs text-amber-600 mt-1">{pctEmProducao}% do total</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-5 shadow-sm">
          <p className="text-sm text-blue-700 mb-1">Aguardando Distribuição</p>
          <p className="text-3xl font-bold text-blue-800">{stats.refAguardando}</p>
          <p className="text-xs text-blue-600 mt-1">{pctAguardando}% do total</p>
        </div>
      </div>

      {/* Progresso por Coleção */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Progresso por Coleção</h3>
          <Link
            href="/relatorios"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Ver Relatório Detalhado
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Coleção
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Referências
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[30%]">
                  Progresso
                </th>
                <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {progressoColecoes.map((col) => (
                <tr key={col.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{col.nome}</p>
                    <p className="text-xs text-gray-400">{col.codigo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        col.status
                      )}`}
                    >
                      {getStatusLabel(col.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {col.totalReferencias}
                      </span>
                      <Link
                        href={`/colecoes/${col.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all ${
                            col.percentual >= 100 ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${Math.min(col.percentual, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 min-w-[50px] text-right">
                        {col.percentual}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {col.produzidas.toLocaleString("pt-BR")} de{" "}
                      {col.previstas.toLocaleString("pt-BR")} peças
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/colecoes/${col.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {progressoColecoes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    Não há coleções cadastradas no sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Últimas Atualizações de Produção */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Últimas Atualizações de Produção
          </h3>
          {nivel !== "visualizador" && (
            <Link
              href="/producao/novo"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-pink-500 rounded-lg hover:bg-pink-600 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Registrar Produção
            </Link>
          )}
        </div>
        <div className="p-6">
          {ultimasAtualizacoes.length === 0 ? (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-700">
              Não há registros de produção no sistema.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Referência
                    </th>
                    <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Coleção
                    </th>
                    <th className="text-right pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Produzido
                    </th>
                    <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ultimasAtualizacoes.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 text-sm text-gray-700">
                        {formatDate(p.data_producao)}
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/referencias/${p.referencia_id}`}
                          className="hover:text-pink-600 transition-colors"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {p.referencia.codigo}
                          </span>
                          <p className="text-xs text-gray-400">{p.referencia.nome}</p>
                        </Link>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {p.referencia.colecao.nome}
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {p.quantidade_dia.toLocaleString("pt-BR")}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">peças</span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            p.status || "normal"
                          )}`}
                        >
                          {getStatusLabel(p.status || "normal")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Metas de Produção */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Metas de Produção</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Meta Diária */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Meta Diária</p>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-3xl font-bold text-gray-900">
                  {metas.producaoHoje.toLocaleString("pt-BR")}
                </span>
                <span className="text-sm text-gray-400">
                  de {metas.metaDiaria.toLocaleString("pt-BR")} peças
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    pctDiario >= 100 ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${pctDiario}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {pctDiario.toFixed(1)}% da meta diária
              </p>
            </div>

            {/* Meta Semanal */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Meta Semanal</p>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-3xl font-bold text-gray-900">
                  {metas.producaoSemana.toLocaleString("pt-BR")}
                </span>
                <span className="text-sm text-gray-400">
                  de {metas.metaSemanal.toLocaleString("pt-BR")} peças
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    pctSemanal >= 100 ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${pctSemanal}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {pctSemanal.toFixed(1)}% da meta semanal
              </p>
            </div>

            {/* Meta Mensal */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <p className="text-sm text-gray-500 mb-3">Meta Mensal</p>
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-3xl font-bold text-gray-900">
                  {metas.producaoMes.toLocaleString("pt-BR")}
                </span>
                <span className="text-sm text-gray-400">
                  de {metas.metaMensal.toLocaleString("pt-BR")} peças
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all ${
                    pctMensal >= 100 ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${pctMensal}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {pctMensal.toFixed(1)}% da meta mensal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referências com Prazo Crítico */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Referências com Prazo Crítico
          </h3>
        </div>
        <div className="p-6">
          {refCriticas.length === 0 ? (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-sm text-green-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Não há referências com prazo crítico no momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Referência
                    </th>
                    <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Coleção
                    </th>
                    <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Produzido
                    </th>
                    <th className="text-left pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-[25%]">
                      Progresso
                    </th>
                    <th className="text-center pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Dias Restantes
                    </th>
                    <th className="text-center pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {refCriticas.map((ref) => {
                    const pctRef =
                      ref.previsao_producao > 0
                        ? Math.round(
                            (ref.quantidade_produzida / ref.previsao_producao) * 1000
                          ) / 10
                        : 0;
                    return (
                      <tr key={ref.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3">
                          <p className="text-sm font-semibold text-gray-900">{ref.codigo}</p>
                          <p className="text-xs text-gray-400">{ref.nome}</p>
                        </td>
                        <td className="py-3 text-sm text-gray-500">{ref.colecao_nome}</td>
                        <td className="py-3 text-sm text-gray-700">
                          {ref.quantidade_produzida} de {ref.previsao_producao}
                        </td>
                        <td className="py-3">
                          <div className="w-full bg-gray-100 rounded-full h-2.5">
                            <div
                              className="h-2.5 rounded-full bg-red-500"
                              style={{ width: `${Math.min(pctRef, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {pctRef}% concluído
                          </p>
                        </td>
                        <td className="py-3 text-center">
                          {ref.diasRestantes !== null ? (
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                ref.diasRestantes <= 0
                                  ? "bg-red-100 text-red-700"
                                  : ref.diasRestantes <= 7
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {ref.diasRestantes <= 0
                                ? "Vencido"
                                : `${ref.diasRestantes} dias`}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <Link
                            href={`/referencias/${ref.id}`}
                            className="inline-flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
