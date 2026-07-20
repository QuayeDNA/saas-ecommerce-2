import { useState, useEffect, useCallback } from "react";
import { FaTimes, FaSearch, FaTrash, FaPlus } from "react-icons/fa";
import { settingsService } from "../../../../services/settings.service";

interface KnownNumbersDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStatsChange: () => void;
}

export default function KnownNumbersDialog({ isOpen, onClose, onStatsChange }: KnownNumbersDialogProps) {
  const [numbers, setNumbers] = useState<Array<{ _id: string; phone: string; importedAt: string }>>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const limit = 20;

  const fetchNumbers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await settingsService.listMtnNumbers(page, limit, search);
      setNumbers(result.numbers);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (isOpen) fetchNumbers();
  }, [isOpen, fetchNumbers]);

  const handleAdd = async () => {
    if (!newPhone.trim()) return;
    setError("");
    try {
      await settingsService.addMtnNumber(newPhone.trim());
      setNewPhone("");
      await fetchNumbers();
      onStatsChange();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    try {
      await settingsService.deleteMtnNumber(id);
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
      await fetchNumbers();
      onStatsChange();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setError("");
    try {
      await settingsService.bulkDeleteMtnNumbers([...selectedIds]);
      setSelectedIds(new Set());
      await fetchNumbers();
      onStatsChange();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Known Numbers</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        {/* Add + Search */}
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add phone number..."
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm"
            />
            <button
              onClick={handleAdd}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1"
            >
              <FaPlus size={12} /> Add
            </button>
          </div>

          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search numbers..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="px-4 pb-2 flex items-center gap-2">
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
            >
              Delete ({selectedIds.size})
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 border border-gray-300 text-gray-500 rounded-lg text-sm hover:bg-gray-50"
            >
              Clear
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Loading...</p>
          ) : numbers.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No known numbers found</p>
          ) : (
            <div className="space-y-1">
              {numbers.map((num) => (
                <div
                  key={num._id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 group"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(num._id)}
                      onChange={() => toggleSelect(num._id)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm text-gray-700 font-mono">{num.phone}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(num._id)}
                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
            <span>{total} total</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-2 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Prev
              </button>
              <span className="px-2 py-1">{page} / {totalPages}</span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2 py-1 border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
