export const statusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    expired: "bg-red-100 text-red-800",
    archived: "bg-yellow-100 text-yellow-800",
  };
  return colors[status] || colors.draft;
};

export const priorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };
  return colors[priority] || colors.medium;
};
