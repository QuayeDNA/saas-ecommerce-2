import React from "react";
import { X } from "lucide-react";
import { Dialog } from "../../../design-system/components/dialog";
import { DialogHeader } from "../../../design-system/components/dialog-header";
import { DialogBody } from "../../../design-system/components/dialog-body";
import type { Announcement, AnnouncementStats } from "../../../types/announcement";

interface Props {
  isOpen: boolean;
  announcement: Announcement | null;
  stats: AnnouncementStats | null;
  onClose: () => void;
}

export const AnnouncementStatsDialog: React.FC<Props> = ({
  isOpen,
  announcement,
  stats,
  onClose,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Announcement Statistics
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </DialogHeader>

      <DialogBody>
        {stats && announcement && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {announcement.title}
              </h3>
              <p className="text-sm text-gray-500">
                {announcement.message}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  Total Eligible Users
                </div>
                <div className="text-xl sm:text-2xl font-bold">
                  {stats.totalEligibleUsers}
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Viewed</div>
                <div className="text-xl sm:text-2xl font-bold">
                  {stats.viewedCount}
                </div>
                <div className="text-sm text-gray-500">
                  {stats.viewedPercentage}%
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600">Acknowledged</div>
                <div className="text-xl sm:text-2xl font-bold">
                  {stats.acknowledgedCount}
                </div>
                <div className="text-sm text-gray-500">
                  {stats.acknowledgedPercentage}%
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-gray-600">Not Viewed</div>
                <div className="text-xl sm:text-2xl font-bold">
                  {stats.totalEligibleUsers - stats.viewedCount}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
};
