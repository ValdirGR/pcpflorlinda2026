"use client";

interface GaugeData {
    mediaNecessaria: number;
    mediaRealizada: number;
    totalMeta: number;
    totalProduzido: number;
}

export function GaugeCapacidade({ data }: { data: GaugeData }) {
    const ratio = data.mediaNecessaria > 0
        ? data.mediaRealizada / data.mediaNecessaria
        : 0;

    const percentage = Math.min(ratio * 100, 150);

    let color = "#ef4444"; // red
    let statusText = "Abaixo do Ritmo";
    let bgColor = "bg-red-50";
    let borderColor = "border-red-200";

    if (ratio >= 1) {
        color = "#22c55e";
        statusText = "Acima do Ritmo";
        bgColor = "bg-green-50";
        borderColor = "border-green-200";
    } else if (ratio >= 0.85) {
        color = "#eab308";
        statusText = "Atenção";
        bgColor = "bg-yellow-50";
        borderColor = "border-yellow-200";
    }

    // SVG gauge angles
    const startAngle = -135;
    const endAngle = 135;
    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + (totalAngle * Math.min(percentage, 150)) / 150;

    const cx = 100;
    const cy = 100;
    const r = 75;

    function polarToCartesian(angle: number) {
        const rad = (angle * Math.PI) / 180;
        return {
            x: cx + r * Math.cos(rad),
            y: cy + r * Math.sin(rad),
        };
    }

    const arcStart = polarToCartesian(startAngle);
    const arcEnd = polarToCartesian(currentAngle);
    const arcBgEnd = polarToCartesian(endAngle);

    const largeArc = currentAngle - startAngle > 180 ? 1 : 0;
    const bgLargeArc = endAngle - startAngle > 180 ? 1 : 0;

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Capacidade Produtiva
            </h3>
            <p className="text-xs text-gray-400 mb-4">Média diária necessária vs realizada</p>

            <div className="flex flex-col items-center">
                <svg viewBox="0 0 200 140" className="w-48 h-auto">
                    {/* Background arc */}
                    <path
                        d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 ${bgLargeArc} 1 ${arcBgEnd.x} ${arcBgEnd.y}`}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="14"
                        strokeLinecap="round"
                    />
                    {/* Value arc */}
                    <path
                        d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`}
                        fill="none"
                        stroke={color}
                        strokeWidth="14"
                        strokeLinecap="round"
                    />
                    {/* Center text */}
                    <text x={cx} y={cy - 5} textAnchor="middle" className="text-2xl font-bold" fill={color}>
                        {Math.round(percentage)}%
                    </text>
                    <text x={cx} y={cy + 14} textAnchor="middle" className="text-[10px]" fill="#94a3b8">
                        do ritmo ideal
                    </text>
                </svg>

                <div className={`mt-3 px-4 py-2 rounded-lg ${bgColor} ${borderColor} border text-center`}>
                    <p className="text-sm font-semibold" style={{ color }}>
                        {statusText}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-400">Necessária/dia</p>
                        <p className="text-lg font-bold text-gray-900">
                            {data.mediaNecessaria.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-400">Realizada/dia</p>
                        <p className="text-lg font-bold" style={{ color }}>
                            {data.mediaRealizada.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
