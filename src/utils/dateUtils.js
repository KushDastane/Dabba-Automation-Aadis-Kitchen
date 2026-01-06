export const getMonthKey = (date = new Date()) => {
  return date.toISOString().slice(0, 7); // YYYY-MM
};

export const isInMonth = (timestamp, monthKey) => {
  const date = timestamp.toDate();
  return date.toISOString().startsWith(monthKey);
};
