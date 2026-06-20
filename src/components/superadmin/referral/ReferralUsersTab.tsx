import { useState } from "react";
import { FaUsers, FaTh, FaList, FaUser, FaPhone, FaCalendar, FaTag, FaInfoCircle, FaTimes, FaShoppingBag } from "react-icons/fa";
import type { ReferralAdminUser, ReferralAdminUserDetail } from "../../../types/referral";
import { Button, Card, CardBody, Badge, Spinner, Table, TableHeader, TableBody, TableRow, TableHeaderCell, TableCell, Pagination, Dialog, DialogHeader, DialogBody } from "../../../design-system";
import { referralService } from "../../../services/referral.service";

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GH", { day: "2-digit", month: "short", year: "numeric" });
};

const formatTime = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" });
};

interface ReferralUsersTabProps {
  users: ReferralAdminUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
  loading: boolean;
  onPageChange: (page: number) => void;
}

export const ReferralUsersTab = ({ users, pagination, loading, onPageChange }: ReferralUsersTabProps) => {
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [detailUser, setDetailUser] = useState<ReferralAdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const handleViewDetail = async (userId: string) => {
    setDetailLoading(true);
    try {
      const detail = await referralService.getAdminUserDetail(userId);
      setDetailUser(detail);
    } catch {
      setDetailUser(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const formatCurrency = (val: number) => `GHS ${(val || 0).toFixed(2)}`;

  return (
    <>
      <Card variant="outlined">
        <CardBody>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2" style={{ color: "var(--color-text)" }}>
              <FaUsers className="w-4 h-4" style={{ color: "var(--color-primary-500)" }} /> Referred Users
              <Badge variant="subtle" colorScheme="info" size="sm">{pagination.total}</Badge>
            </h3>
            <div className="flex rounded-lg p-0.5" style={{ background: "var(--color-control-bg)" }}>
              <Button
                onClick={() => setViewMode("card")}
                variant={viewMode === "card" ? "outline" : "ghost"}
                size="sm"
              >
                <FaTh className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </Button>
              <Button
                onClick={() => setViewMode("table")}
                variant={viewMode === "table" ? "outline" : "ghost"}
                size="sm"
              >
                <FaList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8" style={{ color: "var(--color-muted-text)" }}>
              <FaUsers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No referred users found</p>
            </div>
          ) : viewMode === "card" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {users.map((u) => (
                  <Card key={u._id} variant="outlined">
                    <CardBody>
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
                          style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }}
                        >
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>{u.fullName}</p>
                          <p className="text-xs truncate" style={{ color: "var(--color-muted-text)" }}>{u.email}</p>
                        </div>
                        <Badge colorScheme={u.status === "active" ? "success" : "error"} variant="subtle" size="sm">
                          {u.status}
                        </Badge>
                      </div>
                      <div className="space-y-1.5 text-xs" style={{ color: "var(--color-secondary-text)" }}>
                        <div className="flex items-center gap-2">
                          <FaPhone className="w-3 h-3 shrink-0" style={{ color: "var(--color-muted-text)" }} />
                          <span className="truncate">{u.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUser className="w-3 h-3 shrink-0" style={{ color: "var(--color-muted-text)" }} />
                          <span className="truncate">
                            Referred by: {u.referredBy?.fullName || <span style={{ color: "var(--color-muted-text)" }}>—</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendar className="w-3 h-3 shrink-0" style={{ color: "var(--color-muted-text)" }} />
                          <span>Joined {formatDate(u.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaTag className="w-3 h-3 shrink-0" style={{ color: "var(--color-muted-text)" }} />
                          <span>Code: {u.referralCode}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaShoppingBag className="w-3 h-3 shrink-0" style={{ color: "var(--color-muted-text)" }} />
                          <span>Orders: {u.orderCount}</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                        <Button
                          type="button"
                          onClick={() => handleViewDetail(u._id)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <FaInfoCircle className="w-3 h-3" /> View Details
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={onPageChange}
                size="sm"
                variant="compact"
              />
            </>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table variant="striped" size="sm">
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Name</TableHeaderCell>
                      <TableHeaderCell>Email</TableHeaderCell>
                      <TableHeaderCell>Phone</TableHeaderCell>
                      <TableHeaderCell>Code</TableHeaderCell>
                      <TableHeaderCell>Referred By</TableHeaderCell>
                      <TableHeaderCell>Orders</TableHeaderCell>
                      <TableHeaderCell>Status</TableHeaderCell>
                      <TableHeaderCell>Joined</TableHeaderCell>
                       <TableHeaderCell>{' '}</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u._id}>
                        <TableCell className="font-medium" style={{ color: "var(--color-text)" }}>{u.fullName}</TableCell>
                        <TableCell className="text-sm" style={{ color: "var(--color-secondary-text)" }}>{u.email}</TableCell>
                        <TableCell className="text-sm" style={{ color: "var(--color-secondary-text)" }}>{u.phone}</TableCell>
                        <TableCell>
                          <Badge variant="subtle" colorScheme="info" size="sm">{u.referralCode}</Badge>
                        </TableCell>
                        <TableCell className="text-sm" style={{ color: "var(--color-secondary-text)" }}>
                          {u.referredBy?.fullName || <span style={{ color: "var(--color-muted-text)" }}>—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge colorScheme={u.orderCount > 0 ? "success" : "default"} variant="subtle" size="sm">
                            {u.orderCount}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge colorScheme={u.status === "active" ? "success" : "error"} variant="subtle" size="sm">
                            {u.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <p className="text-sm">{formatDate(u.createdAt)}</p>
                          <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>{formatTime(u.createdAt)}</p>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            onClick={() => handleViewDetail(u._id)}
                            variant="ghost"
                            size="sm"
                          >
                            <FaInfoCircle className="w-3.5 h-3.5" style={{ color: "var(--color-primary-500)" }} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  totalItems={pagination.total}
                  itemsPerPage={pagination.limit}
                  onPageChange={onPageChange}
                  size="sm"
                  variant="compact"
                />
              </div>
            </>
          )}
        </CardBody>
      </Card>

      <Dialog isOpen={!!detailUser || detailLoading} onClose={() => setDetailUser(null)} size="lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                {detailLoading ? "Loading..." : detailUser?.fullName}
              </h3>
              {detailUser && (
                <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-text)" }}>{detailUser.email}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {detailUser && (
                <Badge colorScheme={detailUser.status === "active" ? "success" : "error"} variant="subtle" size="sm">
                  {detailUser.status}
                </Badge>
              )}
              <Button type="button" onClick={() => setDetailUser(null)} variant="ghost" size="sm">
                <FaTimes className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : detailUser ? (
            <div>
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3 pb-4 mb-4"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <div>
                  <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>Phone</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: "var(--color-text)" }}>{detailUser.phone}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>Referral Code</p>
                  <p className="text-sm font-medium mt-0.5 font-mono" style={{ color: "var(--color-text)" }}>{detailUser.referralCode}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>Referred By</p>
                  <p className="text-sm font-medium mt-0.5 truncate" style={{ color: "var(--color-text)" }}>{detailUser.referredBy?.fullName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>Joined</p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: "var(--color-text)" }}>{formatDate(detailUser.createdAt)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-4">
                <div>
                  <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>Orders Placed</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: "var(--color-text)" }}>{detailUser.orderStats.totalOrders}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>Wallet Balance</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: "var(--color-text)" }}>{formatCurrency(detailUser.walletBalance)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>Commission Balance</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: "var(--color-text)" }}>{formatCurrency(detailUser.commissionBalance)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>People Referred</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: "var(--color-text)" }}>{detailUser.totalReferred}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>Total Order Value</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: "var(--color-text)" }}>{formatCurrency(detailUser.orderStats.totalOrderValue)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>Earnings as Referrer</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: "var(--color-status-success)" }}>{formatCurrency(detailUser.commissionAsReferrer.totalEarned)}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--color-muted-text)" }}>Orders from Referrals</p>
                  <p className="text-xl font-bold mt-0.5" style={{ color: "var(--color-text)" }}>{detailUser.commissionAsReferrer.totalOrders}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogBody>
      </Dialog>
    </>
  );
};