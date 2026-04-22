import type { ReactNode } from "react";
import { Badge, Button, Card, CardBody, CardHeader, Select } from "../../design-system";
import type { SelectOption } from "../../design-system/components/select";
import {
    FaArrowDown,
    FaArrowUp,
    FaChartLine,
    FaDotCircle,
    FaDownload,
    FaMinus,
    FaRedo,
} from "react-icons/fa";
import { formatDateTime } from "./analytics-formatters";

interface CommandSnapshot {
    label: string;
    value: string;
    tone?: "default" | "success" | "warning" | "error" | "info" | "gray";
}

interface AnalyticsCommandCenterProps {
    timeframe: string;
    timeOptions: SelectOption[];
    onTimeframeChange: (value: string) => void;
    onRefresh: () => void;
    onExport: () => void;
    loading?: boolean;
    generatedAt?: string;
    source?: string;
    snapshots: CommandSnapshot[];
}

type SnapshotTone = NonNullable<CommandSnapshot["tone"]>;

const snapshotToneMap: Record<
    SnapshotTone,
    {
        cardClass: string;
        iconClass: string;
        titleClass: string;
        valueClass: string;
        subtitleClass: string;
        subtitleText: string;
        trendIcon: ReactNode;
    }
> = {
    default: {
        cardClass: "bg-[var(--color-surface)] border border-[var(--color-border)]",
        iconClass: "text-[var(--color-secondary-text)]",
        titleClass: "text-[var(--color-secondary-text)]",
        valueClass: "text-[var(--color-text)]",
        subtitleClass: "text-[var(--color-secondary-text)]",
        subtitleText: "Current level",
        trendIcon: <FaMinus className="text-[10px]" />,
    },
    success: {
        cardClass: "bg-[var(--color-success-bg)] border border-[var(--color-success-text)]",
        iconClass: "text-[var(--color-success-text)]",
        titleClass: "text-[var(--color-success-text)]",
        valueClass: "text-[var(--color-text)]",
        subtitleClass: "text-[var(--color-success-text)]",
        subtitleText: "Healthy trend",
        trendIcon: <FaArrowUp className="text-[10px]" />,
    },
    warning: {
        cardClass: "bg-[var(--color-pending-bg)] border border-[var(--color-pending-icon)]",
        iconClass: "text-[var(--color-pending-icon)]",
        titleClass: "text-[var(--color-pending-text)]",
        valueClass: "text-[var(--color-text)]",
        subtitleClass: "text-[var(--color-pending-text)]",
        subtitleText: "Watch closely",
        trendIcon: <FaMinus className="text-[10px]" />,
    },
    error: {
        cardClass: "bg-[var(--color-failed-bg)] border border-[var(--color-failed-icon)]",
        iconClass: "text-[var(--color-failed-icon)]",
        titleClass: "text-[var(--color-failed-text)]",
        valueClass: "text-[var(--color-text)]",
        subtitleClass: "text-[var(--color-failed-text)]",
        subtitleText: "Needs action",
        trendIcon: <FaArrowDown className="text-[10px]" />,
    },
    info: {
        cardClass: "bg-[var(--color-primary-50)] border border-[var(--color-primary-200)]",
        iconClass: "text-[var(--color-primary-500)]",
        titleClass: "text-[var(--color-primary-600)]",
        valueClass: "text-[var(--color-text)]",
        subtitleClass: "text-[var(--color-primary-600)]",
        subtitleText: "Reference metric",
        trendIcon: <FaMinus className="text-[10px]" />,
    },
    gray: {
        cardClass: "bg-[var(--color-gray-100)] border border-[var(--color-gray-200)]",
        iconClass: "text-[var(--color-secondary-text)]",
        titleClass: "text-[var(--color-secondary-text)]",
        valueClass: "text-[var(--color-text)]",
        subtitleClass: "text-[var(--color-secondary-text)]",
        subtitleText: "Awaiting update",
        trendIcon: <FaMinus className="text-[10px]" />,
    },
};

export function AnalyticsCommandCenter({
    timeframe,
    timeOptions,
    onTimeframeChange,
    onRefresh,
    onExport,
    loading = false,
    generatedAt,
    source,
    snapshots,
}: AnalyticsCommandCenterProps) {
    return (
        <section className="space-y-4">
            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <FaChartLine className="text-[var(--color-primary-500)]" />
                            <h1 className="text-lg sm:text-xl font-semibold text-[var(--color-text)]">
                                Sales & Operations Analytics
                            </h1>
                        </div>
                        <p className="text-sm text-[var(--color-muted-text)] max-w-2xl">
                            Monitor platform performance across revenue, orders, users, commissions, and payouts.
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted-text)]">
                            <span className="inline-flex items-center gap-1">
                                <FaDotCircle className="text-[var(--color-secondary-text)]" />
                                Last updated: {generatedAt ? formatDateTime(generatedAt) : "Awaiting data"}
                            </span>
                            {source ? (
                                <Badge colorScheme="gray" size="sm">
                                    {source}
                                </Badge>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <div className="w-full sm:w-auto">
                            <Select
                                value={timeframe}
                                onChange={onTimeframeChange}
                                options={timeOptions}
                                className="w-full"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            <FaRedo className={loading ? "mr-2 animate-spin" : "mr-2"} />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onExport}
                            disabled={loading}
                            className="w-full sm:w-auto"
                        >
                            <FaDownload className="mr-2" />
                            Export CSV
                        </Button>
                    </div>
                </CardHeader>

                <CardBody className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                        {snapshots.map((snapshot) => {
                            const tone = snapshotToneMap[snapshot.tone || "default"];

                            return (
                                <Card
                                    key={snapshot.label}
                                    variant="outlined"
                                    className={`${tone.cardClass} rounded-3xl border p-4`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`mt-1 text-2xl ${tone.iconClass}`}>
                                            <FaDotCircle />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-[11px] uppercase tracking-[0.25em] font-semibold truncate ${tone.titleClass}`}>
                                                {snapshot.label}
                                            </p>
                                            <p className={`mt-2 text-2xl font-bold truncate ${tone.valueClass}`}>
                                                {snapshot.value}
                                            </p>
                                            <div className={`mt-2 inline-flex items-center gap-2 text-[11px] font-semibold ${tone.subtitleClass}`}>
                                                {tone.trendIcon}
                                                <span>{tone.subtitleText}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </CardBody>
            </Card>
        </section>
    );
}
