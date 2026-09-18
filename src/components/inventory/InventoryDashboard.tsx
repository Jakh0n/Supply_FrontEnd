'use client'

import InventoryFilters from '@/components/inventory/InventoryFilters'
import InventorySetupBanner from '@/components/inventory/InventorySetupBanner'
import InventoryStockList from '@/components/inventory/InventoryStockList'
import InventorySummaryBar from '@/components/inventory/InventorySummaryBar'
import StockMovementDialog from '@/components/inventory/StockMovementDialog'
import StockMovementHistory from '@/components/inventory/StockMovementHistory'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import {
	useInventoryProducts,
	useInventorySettings,
	useInventorySummary,
	useStockMovements,
} from '@/hooks/queries'
import {
	InventoryProductFilters,
	Product,
	StockMovementFilters,
} from '@/types'
import { useTranslations } from 'next-intl'
import { useDeferredValue, useState } from 'react'

const DEFAULT_PRODUCT_FILTERS: InventoryProductFilters = {
	status: 'all',
	category: 'all',
	page: 1,
	limit: 20,
}

const DEFAULT_MOVEMENT_FILTERS: StockMovementFilters = {
	type: 'all',
	page: 1,
	limit: 20,
}

export default function InventoryDashboard() {
	const t = useTranslations('inventory')
	const { isAdmin } = useAuth()
	const [productFilters, setProductFilters] = useState(DEFAULT_PRODUCT_FILTERS)
	const [movementFilters, setMovementFilters] = useState(
		DEFAULT_MOVEMENT_FILTERS
	)
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const deferredSearch = useDeferredValue(productFilters.search)
	const effectiveProductFilters = {
		...productFilters,
		search: deferredSearch,
	}

	const settingsQuery = useInventorySettings()
	const summaryQuery = useInventorySummary()
	const productsQuery = useInventoryProducts(effectiveProductFilters)
	const movementsQuery = useStockMovements(movementFilters)
	const hasLoadError =
		settingsQuery.isError ||
		summaryQuery.isError ||
		productsQuery.isError ||
		movementsQuery.isError

	const retryAll = () => {
		settingsQuery.refetch()
		summaryQuery.refetch()
		productsQuery.refetch()
		movementsQuery.refetch()
	}

	return (
		<div className='space-y-6'>
			<header>
				<h1 className='text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl'>
					{t('title')}
				</h1>
				<p className='mt-1 text-sm text-slate-500'>{t('subtitle')}</p>
			</header>

			<InventorySetupBanner
				settings={settingsQuery.data}
				loading={settingsQuery.isLoading}
				canActivate={isAdmin}
			/>

			<InventorySummaryBar
				summary={summaryQuery.data}
				loading={summaryQuery.isLoading}
			/>

			{hasLoadError && (
				<div
					role='alert'
					className='flex flex-col gap-3 border-l-2 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between'
				>
					<span>{t('loadError')}</span>
					<Button variant='outline' size='sm' onClick={retryAll}>
						{t('retry')}
					</Button>
				</div>
			)}

			<Tabs defaultValue='stock'>
				<TabsList className='mb-4 grid w-full grid-cols-2 sm:w-80'>
					<TabsTrigger value='stock'>{t('stock')}</TabsTrigger>
					<TabsTrigger value='history'>{t('history')}</TabsTrigger>
				</TabsList>

				<TabsContent value='stock' className='space-y-4'>
					<InventoryFilters
						filters={productFilters}
						onChange={setProductFilters}
					/>
					<InventoryStockList
						products={productsQuery.data?.products ?? []}
						pagination={productsQuery.data?.pagination}
						loading={productsQuery.isLoading || productsQuery.isFetching}
						onAdjust={setSelectedProduct}
						onPageChange={page =>
							setProductFilters(current => ({ ...current, page }))
						}
					/>
				</TabsContent>

				<TabsContent value='history'>
					<StockMovementHistory
						movements={movementsQuery.data?.movements ?? []}
						pagination={movementsQuery.data?.pagination}
						filters={movementFilters}
						loading={movementsQuery.isLoading || movementsQuery.isFetching}
						onFiltersChange={setMovementFilters}
					/>
				</TabsContent>
			</Tabs>

			<StockMovementDialog
				product={selectedProduct}
				open={selectedProduct !== null}
				canSetBalance
				onOpenChange={open => {
					if (!open) setSelectedProduct(null)
				}}
			/>
		</div>
	)
}
