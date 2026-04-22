import { FaArrowDown, FaArrowUp, FaLightbulb } from "react-icons/fa";
import { Badge, Card, CardBody, CardHeader, Skeleton } from "../../design-system";

interface Insight {
    title: string;
    type: "positive" | "warning" | "info";
    description: string;
}

interface AnalyticsInsightsStageProps {
    loading: boolean;
    insights: Insight[];
}

const insightStyleMap = {
    positive: {
        icon: <FaArrowUp className="text-green-500" />,
        badge: "success" as const,
        label: "Positive",
    },
    warning: {
        icon: <FaArrowDown className="text-amber-500" />,
        badge: "warning" as const,
        label: "Attention",
    },
    info: {
        icon: <FaLightbulb className="text-blue-500" />,
        badge: "info" as const,
        label: "Insight",
    },
};

export function AnalyticsInsightsStage({ loading, insights }: AnalyticsInsightsStageProps) {
    return (
        <section>
            <Card className="rounded-3xl p-4 sm:p-5">
                <CardHeader className="pb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text)]">Business Insights</h3>
                    <p className="text-xs sm:text-sm text-[var(--color-muted-text)] mt-1">
                        Key takeaways to support operational and growth decisions.
                        </p>
                 </CardHeader>
                        <CardBody>
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <Card key={index} className="rounded-3xl border border-[var(--color-border)] p-4">
                                            <CardBody className="pt-0 space-y-2">
                                                <Skeleton width="140px" height="0.95rem" />
                                                <Skeleton width="100%" height="0.9rem" />
                                                <Skeleton width="85%" height="0.9rem" />
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            ) : insights.length === 0 ? (
                                <p className="text-sm text-[var(--color-secondary-text)]">No insights available for this period.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    {insights.map((insight, index) => {
                                        const style = insightStyleMap[insight.type] || insightStyleMap.info;

                                        return (
                                            <Card key={`${insight.title}-${index}`} className="rounded-3xl border border-[var(--color-border)] p-4 sm:p-5">
                                                <CardBody className="pt-0">
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 text-lg">{style.icon}</div>
                                                        <div className="space-y-2">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h4 className="text-sm font-semibold text-[var(--color-text)]">{insight.title}</h4>
                                                                <Badge variant="subtle" colorScheme={style.badge} size="sm">
                                                                    {style.label}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-[var(--color-secondary-text)]">{insight.description}</p>
                                                        </div>
                                                    </div>
                                                </CardBody>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </section>
                );
}
