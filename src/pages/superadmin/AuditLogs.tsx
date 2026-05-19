import {
  AuditLogTable,
  RecentActivityFeed,
  AuditStatsWidget,
} from "../../components/audit";
import { Card, CardBody } from "../../design-system";

export default function AuditLogsPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-xl font-bold sm:text-2xl"
          style={{ color: "var(--color-primary-600)" }}
        >
          Audit Logs
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2">
          <AuditStatsWidget />
        </div>

        <div className="lg:col-span-1">
          <RecentActivityFeed limit={10} />
        </div>
      </div>

      <Card>
        <CardBody>
          <AuditLogTable />
        </CardBody>
      </Card>
    </div>
  );
}
