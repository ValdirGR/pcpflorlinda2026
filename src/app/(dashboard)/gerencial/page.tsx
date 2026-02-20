import prisma from "@/lib/prisma";
import { GerencialContent } from "@/components/gerencial/gerencial-content";

export const dynamic = "force-dynamic";

async function getGerencialData() {
    const [colecoes, referencias, etapasAtrasadas, producoes] = await Promise.all([
        prisma.colecao.findMany({
            where: { status: { not: "desabilitada" } },
            select: {
                id: true,
                nome: true,
                codigo: true,
                data_inicio: true,
                data_fim: true,
                referencias: {
                    select: {
                        id: true,
                        codigo: true,
                        nome: true,
                        previsao_producao: true,
                        quantidade_produzida: true,
                        status: true,
                        etapas: {
                            select: { nome: true, status: true, data_inicio: true, data_fim: true },
                            orderBy: { created_at: "asc" as const },
                        },
                    },
                },
            },
            orderBy: { nome: "asc" },
        }),
        prisma.referencia.findMany({
            where: { colecao: { status: { not: "desabilitada" } } },
            select: {
                id: true,
                codigo: true,
                nome: true,
                previsao_producao: true,
                quantidade_produzida: true,
                status: true,
            },
        }),
        prisma.etapaProducao.findMany({
            where: {
                status: { in: ["pendente", "em_andamento"] },
                data_fim: { lt: new Date() },
                referencia: { colecao: { status: { not: "desabilitada" } } },
            },
            include: {
                referencia: { select: { codigo: true, nome: true } },
            },
            orderBy: { data_fim: "asc" },
        }),
        prisma.producao.findMany({
            where: {
                referencia: { colecao: { status: { not: "desabilitada" } } },
            },
            select: { quantidade_dia: true, data_producao: true },
            orderBy: { data_producao: "asc" },
        }),
    ]);

    // Serialize dates to strings for client component
    return {
        colecoes: colecoes.map((c) => ({
            ...c,
            data_inicio: c.data_inicio.toISOString(),
            data_fim: c.data_fim.toISOString(),
            referencias: c.referencias.map((r) => ({
                ...r,
                etapas: r.etapas.map((e) => ({
                    ...e,
                    data_inicio: e.data_inicio?.toISOString() ?? null,
                    data_fim: e.data_fim?.toISOString() ?? null,
                })),
            })),
        })),
        referencias,
        etapasAtrasadas: etapasAtrasadas.map((e) => ({
            id: e.id,
            nome: e.nome,
            data_fim: e.data_fim?.toISOString() ?? null,
            referencia: e.referencia,
        })),
        producoes: producoes.map((p) => ({
            quantidade_dia: p.quantidade_dia,
            data_producao: p.data_producao.toISOString(),
        })),
    };
}

export default async function GerencialPage() {
    const data = await getGerencialData();

    return (
        <GerencialContent
            colecoes={data.colecoes}
            referencias={data.referencias}
            etapasAtrasadas={data.etapasAtrasadas}
            producoes={data.producoes}
        />
    );
}
