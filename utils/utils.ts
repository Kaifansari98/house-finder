export const normalizeStatusKey = (status?: string) => {
  if (!status) return "";

  return status
    .toLowerCase()
    .replace(/\s+/g, "") // spaces remove
    .replace(/\//g, "") // slash remove
    .replace(/-/g, ""); // dash remove
};

export const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";

  const date = new Date(dateStr);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateWithTime = (date: string | Date) => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (isNaN(parsedDate.getTime())) {
    return "-"; // fallback if invalid date
  }

  return parsedDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const getInitials = (value?: string | null): string => {
  if (!value) return "?";

  const words = value.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return "?";

  // Agar sirf ek word hai → ek letter
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  // Agar 2 ya zyada words → first 2 words ke first letters
  return words[0].charAt(0).toUpperCase() + words[1].charAt(0).toUpperCase();
};
