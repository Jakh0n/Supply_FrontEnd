import {
	DrinkOrderFilters,
	InventoryProductFilters,
	OrderFilters,
	ProductFilters,
	StockMovementFilters,
} from '@/types'

export const queryKeys = {
	orders: {
		all: ['orders'] as const,
		lists: () => [...queryKeys.orders.all, 'list'] as const,
		list: (filters: OrderFilters = {}) =>
			[...queryKeys.orders.lists(), filters] as const,
		details: () => [...queryKeys.orders.all, 'detail'] as const,
		detail: (id: string) => [...queryKeys.orders.details(), id] as const,
		dayContext: (requestedDate?: string) =>
			[...queryKeys.orders.all, 'dayContext', requestedDate ?? 'today'] as const,
		dashboardStats: () => [...queryKeys.orders.all, 'dashboardStats'] as const,
	},
	drinkOrders: {
		all: ['drinkOrders'] as const,
		lists: () => [...queryKeys.drinkOrders.all, 'list'] as const,
		list: (filters: DrinkOrderFilters = {}) =>
			[...queryKeys.drinkOrders.lists(), filters] as const,
	},
	branches: {
		names: ['branches', 'names'] as const,
	},
	products: {
		all: ['products'] as const,
		lists: () => [...queryKeys.products.all, 'list'] as const,
		list: (filters: ProductFilters = {}) =>
			[...queryKeys.products.lists(), filters] as const,
	},
	inventory: {
		all: ['inventory'] as const,
		summary: () => [...queryKeys.inventory.all, 'summary'] as const,
		settings: () => [...queryKeys.inventory.all, 'settings'] as const,
		products: (filters: InventoryProductFilters = {}) =>
			[...queryKeys.inventory.all, 'products', filters] as const,
		movements: (filters: StockMovementFilters = {}) =>
			[...queryKeys.inventory.all, 'movements', filters] as const,
	},
}
