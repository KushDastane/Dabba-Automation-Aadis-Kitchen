/**
 * Format Firestore timestamp / JS Date into readable date
 * Example: 3 Jan 2026
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "";

  // Firestore Timestamp
  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // JS Date
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return "";
};

