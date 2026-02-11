"use client";

import { useState, useEffect } from "react";
import { 
  Factory, 
  CheckCircle2, 
  Truck, 
  AlertTriangle, 
  Play, 
  Pause, 
  Maximize2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductionChart } from "@/components/dashboard/production-chart";
import { CollectionProgress } from "@/components/dashboard/collection-progress";

interface TVViewProps {
  stats: {
    totalColecoes: number;
    totalReferencias: number;
    totalProduzidas: number;
    totalPrevistas: number;
    refFinalizadas: number;
    etapasAtrasadas: number;
  };
  prodByDay: { date: string; total: number }[];
  collectionProgress: any[];
  recentProduction: any[];
  lateEtapas: any[];
}

const SLIDE_DURATION = 15000; // 15 seconds

export function TVView({ 
  stats, 
  prodByDay, 
  collectionProgress, 
  recentProduction, 
  lateEtapas 
}: TVViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % 4);
      }, SLIDE_DURATION);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const slides = [
    {
      id: "producao",
      title: "PRODUÇÃO HOJE",
      color: "bg-blue-600",
      textColor: "text-blue-600",
      icon: Factory,
      component: <ProductionSlide stats={stats} prodByDay={prodByDay} recent={recentProduction} />
    },
    {
      id: "qualidade",
      title: "QUALIDADE",
      color: "bg-green-600",
      textColor: "text-green-600",
      icon: CheckCircle2,
      component: <QualitySlide stats={stats} />
    },
    {
      id: "entregas",
      title: "ENTREGAS",
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      icon: Truck, // Using Truck as proxy for deliveries
      component: <DeliverySlide collectionProgress={collectionProgress} />
    },
    {
      id: "alertas",
      title: "ALERTAS",
      color: "bg-red-600",
      textColor: "text-red-600",
      icon: AlertTriangle,
      component: <AlertsSlide lateEtapas={lateEtapas} />
    }
  ];

  const CurrentSlide = slides[currentSlide];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-slate-900 text-white overflow-hidden rounded-xl shadow-2xl border border-slate-700">
      {/* Header / Traffic Light Strip */}
      <div className="flex items-center justify-between p-6 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-lg", CurrentSlide.color)}>
            <CurrentSlide.icon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{CurrentSlide.title}</h1>
        </div>
        
        {/* Controls & Mini Status */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2 mr-8">
            {slides.map((s, idx) => (
              <div 
                key={s.id}
                className={cn(
                  "h-4 w-4 rounded-full transition-all duration-500",
                  idx === currentSlide ? s.color : "bg-slate-700",
                  idx === currentSlide && "scale-125 ring-2 ring-white/50"
                )}
              />
            ))}
          </div>
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 hover:bg-slate-700 rounded-full">
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 bg-slate-900 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
           {isPlaying && (
             <div 
               key={currentSlide} // Reset animation on slide change
               className={cn("h-full", CurrentSlide.color)}
               style={{ 
                 width: '100%',
                 animation: `shrink ${SLIDE_DURATION}ms linear forwards` 
               }}
             />
           )}
        </div>
        
        <div className="h-full animate-in fade-in duration-500 slide-in-from-bottom-4">
          {CurrentSlide.component}
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// Sub-components for slides

function ProductionSlide({ stats, prodByDay, recent }: { stats: any, prodByDay: any[], recent: any[] }) {
  const percentage = Math.round((stats.totalProduzidas / (stats.totalPrevistas || 1)) * 100);
  
  return (
    <div className="grid grid-cols-3 gap-8 h-full">
      <div className="col-span-1 bg-slate-800/50 rounded-2xl p-6 border border-slate-700 flex flex-col items-center justify-center text-center">
        <h3 className="text-2xl text-slate-400 mb-2">Total Produzido</h3>
        <p className="text-7xl font-bold text-blue-400">{stats.totalProduzidas.toLocaleString()}</p>
        <div className="mt-4 text-xl">
           de <span className="text-slate-400">{stats.totalPrevistas.toLocaleString()}</span> previstos
        </div>
        <div className="mt-8 w-full bg-slate-700 rounded-full h-6 overflow-hidden">
          <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${Math.min(percentage, 100)}%` }} />
        </div>
        <p className="mt-2 text-2xl font-bold">{percentage}% da Meta</p>
      </div>

      <div className="col-span-2 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold mb-4 text-slate-300">Últimas Produções</h3>
        <div className="space-y-4">
          {recent.slice(0, 6).map((item: any, i: number) => (
             <div key={i} className="flex items-center justify-between p-4 bg-slate-800 rounded-xl border-l-4 border-blue-500">
               <div>
                 <p className="font-bold text-lg">{item.referencia.nome}</p>
                 <p className="text-sm text-slate-400">{item.referencia.codigo}</p>
               </div>
               <div className="text-right">
                 <p className="text-2xl font-bold text-blue-400">+{item.quantidade_dia}</p>
                 <p className="text-xs text-slate-400">{new Date(item.data_producao).toLocaleDateString()}</p>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QualitySlide({ stats }: { stats: any }) {
  // Mock quality data since we don't have explicit QA module
  const finished = stats.refFinalizadas || 0;
  const total = stats.totalReferencias || 1;
  const rate = Math.round((finished / total) * 100);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-12">
      <div className="grid grid-cols-2 gap-12 w-full max-w-5xl">
         <div className="bg-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center border-2 border-green-500/30">
            <h3 className="text-3xl text-slate-400 uppercase tracking-widest mb-4">Referências Finalizadas</h3>
            <span className="text-9xl font-bold text-green-500">{finished}</span>
         </div>
         <div className="bg-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center border-2 border-slate-700">
            <h3 className="text-3xl text-slate-400 uppercase tracking-widest mb-4">Total em Linha</h3>
            <span className="text-9xl font-bold text-slate-200">{stats.totalReferencias}</span>
         </div>
      </div>
      
      <div className="text-center">
         <div className="text-2xl text-slate-400 mb-4">Índice de Conclusão</div>
         <div className="text-6xl font-black text-green-400">{rate}%</div>
      </div>
    </div>
  );
}

function DeliverySlide({ collectionProgress }: { collectionProgress: any[] }) {
  return (
    <div className="h-full overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {collectionProgress.slice(0, 4).map((col, idx) => (
          <div key={idx} className="bg-slate-800 rounded-2xl p-6 border-l-8 border-yellow-500">
             <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold">{col.name}</h3>
                <span className="text-yellow-500 font-mono text-xl">{Math.round(col.percentage)}%</span>
             </div>
             <div className="w-full bg-slate-700 h-4 rounded-full mb-4">
                <div 
                  className="bg-yellow-500 h-full rounded-full" 
                  style={{ width: `${Math.min(col.percentage, 100)}%` }}
                />
             </div>
             <div className="flex justify-between text-slate-400 text-lg">
                <span>Prod: {col.produced}</span>
                <span>Meta: {col.total}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsSlide({ lateEtapas }: { lateEtapas: any[] }) {
  if (lateEtapas.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-green-500">
        <CheckCircle2 className="h-48 w-48 mb-6 opacity-80" />
        <h2 className="text-5xl font-bold">Nenhum Alerta Ativo</h2>
        <p className="text-2xl text-slate-400 mt-4">A produção está em dia!</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 mb-6 flex items-center justify-center gap-4">
         <AlertTriangle className="h-8 w-8 text-red-500" />
         <span className="text-2xl font-bold text-red-500">{lateEtapas.length} Etapas em Atraso</span>
      </div>
      
      <div className="grid gap-4">
        {lateEtapas.slice(0, 5).map((etapa, idx) => (
          <div key={idx} className="bg-slate-800 p-6 rounded-xl flex items-center justify-between border-l-4 border-red-600">
             <div>
                <h4 className="text-xl font-bold text-white mb-1">{etapa.referencia.nome}</h4>
                <div className="flex gap-2 text-slate-400">
                   <span>{etapa.referencia.codigo}</span>
                   <span>•</span>
                   <span>{etapa.nome}</span>
                </div>
             </div>
             <div className="text-right">
                <div className="text-red-400 font-bold mb-1">Atrasado desde</div>
                <div className="text-white text-lg">{new Date(etapa.data_fim).toLocaleDateString()}</div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
