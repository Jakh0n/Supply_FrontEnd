import { inventoryApi } from '@/lib/api'
import { queryKeys } from '@/lib/queryKeys'
import {
	InventoryProductFilters,
	ManualStockMovementInput,
	StockMovementFilters,
} from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

const getErrorMessage = (error: unknown): string => {
	if (axios.isAxiosError<{ message?: string }>(error)) {
		return error.response?.data?.message || 'Inventory update failed'
	}
	return 'Inventory update failed'
}

export function useInventorySummary() {
	return useQuery({
		queryKey: queryKeys.inventory.summary(),
		queryFn: inventoryApi.getSummary,
	})
}

export function useInventorySettings() {
	return useQuery({
		queryKey: queryKeys.inventory.settings(),
		queryFn: inventoryApi.getSettings,
	})
}

export function useActivateInventory() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: inventoryApi.activate,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
			queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
			toast.success('Inventory control started')
		},
		onError: error => {
			toast.error(getErrorMessage(error))
		},
	})
}

export function useInventoryProducts(filters: InventoryProductFilters) {
	return useQuery({
		queryKey: queryKeys.inventory.products(filters),
		queryFn: () => inventoryApi.getProducts(filters),
	})
}

export function useStockMovements(filters: StockMovementFilters) {
	return useQuery({
		queryKey: queryKeys.inventory.movements(filters),
		queryFn: () => inventoryApi.getMovements(filters),
	})
}

export function useCreateStockMovement() {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (input: ManualStockMovementInput) =>
			inventoryApi.createMovement(input),
		onSuccess: data => {
			queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all })
			queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
			toast.success(
				`${data.product.name}: ${data.product.amount} ${data.product.unit}`
			)
		},
		onError: error => {
			toast.error(getErrorMessage(error))
		},
	})
}
