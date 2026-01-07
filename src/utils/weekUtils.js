export const getCurrentWeekDates = () => {
  const now = new Date();
  const day = now.getDay() || 7; // Sunday = 7
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);

  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
};
