"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Filter, ChevronDown } from "lucide-react";
import { listarColecoesParaSeletor } from "@/app/actions";

interface ColecaoOpcao {
    id: number;
    nome: string;
    codigo: string;
}

export function CollectionSelector() {
    const router = useRouter();
    const pathname = usePathname();
    const [colecoes, setColecoes] = useState<ColecaoOpcao[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string>("");

    useEffect(() => {
        async function loadColecoes() {
            try {
                const data = await listarColecoesParaSeletor();
                setColecoes(data);
            } catch (error) {
                console.error("Erro ao carregar coleções:", error);
            } finally {
                setLoading(false);
            }
        }
        loadColecoes();
    }, []);

    // Sincroniza o select com a URL atual se estiver em uma página de coleção
    useEffect(() => {
        const match = pathname.match(/\/colecoes\/(\d+)/);
        if (match) {
            setSelectedId(match[1]);
        } else {
            setSelectedId("");
        }
    }, [pathname]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        if (id) {
            router.push(`/colecoes/${id}`);
        } else {
            router.push("/colecoes");
        }
    };

    if (loading) {
        return (
            <div className="h-9 w-40 bg-gray-100 rounded-lg animate-pulse hidden md:block" />
        );
    }

    return (
        <div className="relative hidden md:flex items-center">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            <select
                value={selectedId}
                onChange={handleChange}
                className="appearance-none pl-9 pr-8 py-2 w-48 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 transition-colors cursor-pointer"
            >
                <option value="">Todas Coleções</option>
                {colecoes.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.codigo} - {c.nome}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
    );
}
