import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { gerarRelatorioPDF, type RelatorioData } from "@/lib/relatorio-pdf";
import { enviarRelatorioEmail } from "@/lib/relatorio-email";
import { calcPercentage } from "@/lib/utils";

// Timeout estendido para Vercel (em ms)
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // Verificar secret para proteger endpoint
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Verificar se é dia útil (seg-sex)
    const agora = new Date();
    const diaSemana = agora.getDay(); // 0=dom, 6=sab
    if (diaSemana === 0 || diaSemana === 6) {
      return NextResponse.json({ message: "Fim de semana — relatório não enviado" });
    }

    // Buscar destinatários ativos
    const destinatarios = await prisma.configEmailRelatorio.findMany({
      where: { ativo: true },
      select: { email: true, nome: true },
    });

    if (destinatarios.length === 0) {
      return NextResponse.json({ message: "Nenhum destinatário ativo" });
    }

    // Buscar dados para o relatório
    const [colecoes, etapasAtrasadas] = await Promise.all([
      prisma.colecao.findMany({
        where: { status: { not: "desabilitada" } },
        include: {
          referencias: {
            select: {
              previsao_producao: true,
              quantidade_produzida: true,
              status: true,
            },
          },
        },
        orderBy: { nome: "asc" },
      }),
      prisma.etapaProducao.findMany({
        where: {
          status: { in: ["pendente", "em_andamento"] },
          data_fim: { lt: new Date() },
          referencia: { colecao: { status: { not: "desabilitada" } } },
        },
        include: {
          referencia: {
            select: {
              codigo: true,
              nome: true,
              colecao: { select: { nome: true } },
            },
          },
        },
        orderBy: { data_fim: "asc" },
        take: 20,
      }),
    ]);

    // Montar dados do relatório
    let totalReferencias = 0;
    let totalFinalizadas = 0;
    let totalEmProducao = 0;
    let totalProduzido = 0;
    let totalPrevisto = 0;

    const colecoesResumo = colecoes.map((c) => {
      const produzidas = c.referencias.reduce((acc, r) => acc + (r.quantidade_produzida || 0), 0);
      const previstas = c.referencias.reduce((acc, r) => acc + (r.previsao_producao || 0), 0);
      const finalizadas = c.referencias.filter((r) => r.status === "finalizada").length;
      const emProducao = c.referencias.filter((r) => r.status !== "finalizada" && r.status !== "arquivada").length;

      totalReferencias += c.referencias.length;
      totalFinalizadas += finalizadas;
      totalEmProducao += emProducao;
      totalProduzido += produzidas;
      totalPrevisto += previstas;

      return {
        nome: c.nome,
        codigo: c.codigo,
        dataInicio: c.data_inicio.toISOString(),
        dataFim: c.data_fim.toISOString(),
        totalReferencias: c.referencias.length,
        finalizadas,
        produzidas,
        previstas,
        percentual: calcPercentage(produzidas, previstas),
      };
    });

    const dadosRelatorio: RelatorioData = {
      resumo: {
        totalColecoes: colecoes.length,
        totalReferencias,
        totalFinalizadas,
        totalEmProducao,
        totalProduzido,
        totalPrevisto,
        percentualGeral: calcPercentage(totalProduzido, totalPrevisto),
      },
      colecoes: colecoesResumo,
      etapasAtrasadas: etapasAtrasadas.map((e) => ({
        nome: e.nome,
        referenciaCodigo: e.referencia.codigo,
        referenciaNome: e.referencia.nome,
        colecaoNome: e.referencia.colecao.nome,
        dataFim: e.data_fim?.toISOString() || "",
      })),
      dataGeracao: agora,
    };

    // Gerar PDF
    const pdfBuffer = gerarRelatorioPDF(dadosRelatorio);

    // Enviar e-mails
    const resultado = await enviarRelatorioEmail(destinatarios, pdfBuffer, agora);

    // Log
    console.log(`[Relatório Diário] ${resultado.sucesso} enviados, ${resultado.erros} falhas`, resultado.detalhes);

    return NextResponse.json({
      message: "Relatório enviado",
      enviados: resultado.sucesso,
      erros: resultado.erros,
      detalhes: resultado.detalhes,
    });
  } catch (error: any) {
    console.error("[Relatório Diário] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao gerar/enviar relatório", detalhes: error.message },
      { status: 500 }
    );
  }
}

// GET para teste manual (protegido pelo mesmo secret)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Redirecionar para POST com o header correto
  return POST(
    new NextRequest(request.url, {
      method: "POST",
      headers: { authorization: `Bearer ${secret}` },
    })
  );
}
