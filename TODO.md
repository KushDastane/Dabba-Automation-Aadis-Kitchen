# TODO: Update Admin Dashboard Stats for Meal-Specific Resets

## Steps to Complete

- [ ] Modify `listenToAdminStats` in `src/services/adminDashboardService.js` to accept `slot` parameter and filter orders by `mealType`
- [ ] Update order listener to compute `totalOrders`, `pendingOrders`, and `studentsToday` from filtered orders
- [ ] Remove dailyStats listener for `totalOrders` since it's now computed per meal
- [ ] Update `AdminDashboard.jsx` to pass `slot` to `listenToAdminStats`
- [ ] Verify that stats reset correctly for lunch and dinner
