import type { ReactNode } from "react";
import { FaArrowDown, FaArrowUp, FaMinus } from "react-icons/fa";
import { Card, CardBody } from "../../design-system";

interface AnalyticsKpiCardItem {
    id: string;
    title: string;
    value: string;
    subtitle: string;
    icon: ReactNode;
    trend: "up" | "down" | "flat";
}

interface AnalyticsKpiGridProps {
    cards: AnalyticsKpiCardItem[];
}

const cardToneMap: Record<
    string,
    {
        cardClass: string;
        iconClass: string;
        titleClass: string;
        valueClass: string;
        upTrendClass: string;
        downTrendClass: string;
        flatTrendClass: string;
        cardStyle?: React.CSSProperties;
    }
> = {
    users: {
        cardClass: "border border-[var(--color-border)] text-white",
        iconClass: "text-white/80",
        titleClass: "text-white/70",
        valueClass: "text-white",
        upTrendClass: "text-[var(--color-success-text)]",
        downTrendClass: "text-[var(--color-failed-text)]",
        flatTrendClass: "text-white/75",
        cardStyle: {
            background: "linear-gradient(to right, var(--color-primary-500), var(--color-primary-700))",
        },
    },
    orders: {
        cardClass: "bg-[var(--color-surface)] border border-[var(--color-border)]",
        iconClass: "text-[var(--color-primary-500)]",
        titleClass: "text-[var(--color-primary-700)]",
        valueClass: "text-[var(--color-text)]",
        upTrendClass: "text-[var(--color-success-text)]",
        downTrendClass: "text-[var(--color-failed-text)]",
        flatTrendClass: "text-[var(--color-primary-700)]",
    },
    revenue: {
        cardClass: "bg-[var(--color-surface)] border border-[var(--color-border)]",
        iconClass: "text-[var(--color-success-text)]",
        titleClass: "text-[var(--color-success-text)]",
        valueClass: "text-[var(--color-text)]",
        upTrendClass: "text-[var(--color-success-text)]",
        downTrendClass: "text-[var(--color-failed-text)]",
        flatTrendClass: "text-[var(--color-success-text)]",
    },
    commissions: {
        cardClass: "bg-[var(--color-surface)] border border-[var(--color-border)]",
        iconClass: "text-[var(--color-pending-icon)]",
        titleClass: "text-[var(--color-pending-text)]",
        valueClass: "text-[var(--color-text)]",
        upTrendClass: "text-[var(--color-success-text)]",
        downTrendClass: "text-[var(--color-failed-text)]",
        flatTrendClass: "text-[var(--color-pending-text)]",
    },
    wallet: {
        cardClass: "bg-[var(--color-surface)] border border-[var(--color-border)]",
        iconClass: "text-[var(--color-primary-500)]",
        titleClass: "text-[var(--color-primary-700)]",
        valueClass: "text-[var(--color-text)]",
        upTrendClass: "text-[var(--color-success-text)]",
        downTrendClass: "text-[var(--color-failed-text)]",
        flatTrendClass: "text-[var(--color-primary-700)]",
    },
    providers: {
        cardClass: "bg-[var(--color-surface)] border border-[var(--color-border)]",
        iconClass: "text-[var(--color-primary-500)]",
        titleClass: "text-[var(--color-primary-700)]",
        valueClass: "text-[var(--color-text)]",
        upTrendClass: "text-[var(--color-success-text)]",
        downTrendClass: "text-[var(--color-failed-text)]",
        flatTrendClass: "text-[var(--color-primary-700)]",
    },
};

const fallbackTone = {
    cardClass: "bg-[var(--color-surface)] border border-[var(--color-border)]",
    iconClass: "text-[var(--color-secondary-text)]",
    titleClass: "text-[var(--color-secondary-text)]",
    valueClass: "text-[var(--color-text)]",
    upTrendClass: "text-[var(--color-success-text)]",
    downTrendClass: "text-[var(--color-failed-text)]",
    flatTrendClass: "text-[var(--color-secondary-text)]",
};

function getTrendDetails(
    trend: AnalyticsKpiCardItem["trend"],
    tone: typeof fallbackTone
) {
    if (trend === "up") {
        return {
            icon: <FaArrowUp className="text-[10px]" />,
            className: tone.upTrendClass,
        };
    }

    if (trend === "down") {
        return {
            icon: <FaArrowDown className="text-[10px]" />,
            className: tone.downTrendClass,
        };
    }

    return {
        icon: <FaMinus className="text-[10px]" />,
        className: tone.flatTrendClass,
    };
}

export function AnalyticsKpiGrid({ cards }: AnalyticsKpiGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {cards.map((card) => {
                const tone = cardToneMap[card.id] ?? fallbackTone;
                const trend = getTrendDetails(card.trend, tone);

                return (
                    <Card
                        key={card.id}
                        variant="outlined"
                        className={`${tone.cardClass} rounded-3xl border p-4 sm:p-5`}
                        style={tone.cardStyle}
                    >
                        <CardBody className="pt-0">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 text-2xl ${tone.iconClass}`}>
                                    {card.icon}
                                </div>

                                <div className="min-w-0 flex-1 space-y-2">
                                    <p className={`text-[11px] uppercase tracking-[0.24em] font-semibold truncate ${tone.titleClass}`}>
                                        {card.title}
                                    </p>
                                    <p className={`text-2xl font-bold leading-tight truncate ${tone.valueClass}`}>
                                        {card.value}
                                    </p>
                                    <p className={`inline-flex items-center gap-1 text-sm font-medium ${trend.className}`}>
                                        {trend.icon}
                                        <span>{card.subtitle}</span>
                                    </p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                );
            })}
        </div>
    );
}

export type { AnalyticsKpiCardItem };
