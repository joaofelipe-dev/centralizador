# Code Deletion Log

## [2026-06-02] Refactor Session - Dead Code Cleanup

### Unused Dependencies Removed
- `react-window@^2.2.7` - Never imported anywhere in the codebase
- `@types/react-window@^1.8.8` - Type package for unused dependency

### Unused Files Deleted (16 files)
- `src/components/BackButton.tsx` - Component not imported anywhere
- `src/components/Admin/OrderEditModal.tsx` - Component not imported anywhere
- `src/components/Admin/OrderList.tsx` - Component not imported anywhere
- `src/components/ui/Accordion.tsx` - Component not imported anywhere
- `src/components/ui/Avatar.tsx` - Component not imported anywhere
- `src/components/ui/calendar.tsx` - Component not imported anywhere
- `src/components/ui/Checkbox.tsx` - Component not imported anywhere
- `src/components/ui/Divider.tsx` - Component not imported anywhere
- `src/components/ui/popover.tsx` - Component not imported anywhere
- `src/components/ui/RadioGroup.tsx` - Component not imported anywhere
- `src/components/ui/Switch.tsx` - Component not imported anywhere
- `src/components/ui/Tabs.tsx` - Component not imported anywhere
- `src/components/ui/Toast.tsx` - Component not imported anywhere
- `src/components/ui/Tooltip.tsx` - Component not imported anywhere
- `src/constants/zIndex.ts` - Constants not imported anywhere
- `src/lib/hooks/useDashboardData.ts` - Hook not imported anywhere
- `src/types/index.ts` - Barrel file not imported anywhere (all types imported from individual files)

### Unused Exports Removed

#### Functions
- `src/lib/offline/db.ts` - `getAll<T>()` (unused utility function)
- `src/lib/offline/queue.ts` - `getAllQueuedOrders()`, `markSyncing()`, `clearQueue()` (unused queue operations)
- `src/lib/offline/cache.ts` - `clearCache()` (unused cache operation)
- `src/lib/offline/sync-engine.ts` - `setupConnectivityMonitor()` (internal function, no longer exported)
- `src/lib/purchase-api.ts` - `getPurchase()` (unused API call)
- `src/lib/sale-api.ts` - `getSale()` (unused API call)

#### Types
- `src/types/api.ts` - `ApiError`, `ApiResponse` (unused types)
- `src/types/auth.ts` - `UserRole` (duplicated type; actual usage imports from TeamManagement)
- `src/types/order.ts` - `OrderFilters`, `OrderListItem` (unused types)
- `src/types/product.ts` - `CategoryOrder` (unused type)
- `src/types/components.ts` - `ButtonProps`, `ProductFilterProps`, `StoreSelectorProps`, `DateInputProps`, `ProductRowProps`, `OrderFormProps`, `OrderListProps`, `FilterState` (unused types; kept `SearchInputProps`)
- `src/components/Button/ButtonVariants.tsx` - `ButtonVariantsProps` (unused type export)
- `src/lib/stock-count-api.ts` - `UpdateCountItemsPayload` (unused type export)

#### Re-exports cleaned from `src/lib/offline/index.ts`
- Removed: `getCachedStores`, `getCachedCategories`, `clearCache`, `getLastSyncTimestamp`
- Removed: `enqueueOrder`, `getPendingOrders`, `getAllQueuedOrders`, `clearQueue`
- Removed: `QueuedOrder`, `SyncEvent`, `SyncEventType` type re-exports
- Functions remain available via direct imports from their source modules

#### Unused imports cleaned
- `src/lib/offline/queue.ts` - Removed `getAllRecords` import (was used only by removed `getAllQueuedOrders`)
- `src/lib/offline/cache.ts` - Removed `clearStore` import (was used only by removed `clearCache`)
- `src/components/Button/ButtonVariants.tsx` - Removed unused `VariantProps` import

### Impact
- Files deleted: 17
- Dependencies removed: 2
- Lines of code removed: ~2,064 (476 insertions, 2,540 deletions)
- Bundle size reduction: small (react-window tree-shaken)

### Testing
- Build: ✅ Compiles successfully
- TypeScript: ✅ No type errors
- Lint: ✅ No lint errors
- Tests: 39/45 passed (6 pre-existing failures in Header.test.tsx - unrelated to cleanup)
