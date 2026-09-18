'use client'

import { Button } from '@/components/ui/button'
import { ProductThumbnail } from '@/components/ui/ProductImage'
import { Skeleton } from '@/components/ui/skeleton'
import { getCategoryDisplayName } from '@/lib/orderCategories'
import { PaginationInfo, Product } from '@/types'
import { useTranslations } from 'next-intl'

interface InventoryStockListProps {
	products: Product[]
	pagination?: PaginationInfo
	loading: boolean
	onAdjust: (product: Product) => void
	onPageChange: (page: number) => void
}

const getStockLabel = (
	product: Product,
	labels: { available: string; low: string; out: string; notCounted: string }
): { label: string; className: string } => {
	if (!product.inventoryInitialized) {
		return { label: labels.notCounted, className: 'bg-amber-50 text-amber-800' }
	}
	if (product.amount <= 0) {
		return { label: labels.out, className: 'bg-red-50 text-red-700' }
	}
	if (product.minimumStock > 0 && product.amount <= product.minimumStock) {
		return { label: labels.low, className: 'bg-amber-50 text-amber-800' }
	}
	return { label: labels.available, className: 'bg-emerald-50 text-emerald-700' }
}

export default function InventoryStockList({
	products,
	pagination,
	loading,
	onAdjust,
	onPageChange,
}: InventoryStockListProps) {
	const t = useTranslations('inventory')

	if (loading) {
		return (
			<div className='space-y-2'>
				{Array.from({ length: 6 }, (_, index) => (
					<Skeleton key={index} className='h-16 w-full' />
				))}
			</div>
		)
	}

	if (products.length === 0) {
		return (
			<div className='py-14 text-center text-sm text-slate-500'>
				{t('noProducts')}
			</div>
		)
	}

	return (
		<div>
			<div className='hidden grid-cols-[minmax(220px,2fr)_1fr_120px_120px_110px_130px] gap-4 border-b px-3 py-2 text-xs font-medium text-slate-500 sm:grid'>
				<span>{t('product')}</span>
				<span>{t('category')}</span>
				<span>{t('onHand')}</span>
				<span>{t('minimum')}</span>
				<span>{t('status')}</span>
				<span className='text-right'>{t('action')}</span>
			</div>

			<ul className='divide-y divide-slate-100'>
				{products.map(product => {
					const stockState = getStockLabel(product, {
						available: t('available'),
						low: t('low'),
						out: t('out'),
						notCounted: t('notCounted'),
					})
					return (
						<li
							key={product._id}
							className='grid gap-3 px-1 py-3 sm:grid-cols-[minmax(220px,2fr)_1fr_120px_120px_110px_130px] sm:items-center sm:px-3'
						>
							<div className='flex min-w-0 items-center gap-3'>
								<ProductThumbnail
									src={product.images?.[0]}
									alt={product.name}
									category={product.category}
									size='sm'
								/>
								<div className='min-w-0'>
									<p className='truncate text-sm font-medium text-slate-950'>
										{product.name}
									</p>
									<p className='text-xs text-slate-500 sm:hidden'>
										{getCategoryDisplayName(product.category)}
									</p>
								</div>
							</div>
							<span className='hidden text-sm text-slate-600 sm:block'>
								{getCategoryDisplayName(product.category)}
							</span>
							<div className='flex items-baseline justify-between sm:block'>
								<span className='text-xs text-slate-500 sm:hidden'>{t('onHand')}</span>
								<span className='font-semibold tabular-nums text-slate-950'>
									{product.amount} {product.unit}
								</span>
							</div>
							<div className='hidden text-sm tabular-nums text-slate-600 sm:block'>
								{product.minimumStock} {product.unit}
							</div>
							<span
								className={`w-fit rounded-md px-2 py-1 text-xs font-medium ${stockState.className}`}
							>
								{stockState.label}
							</span>
							<Button
								variant='outline'
								size='sm'
								onClick={() => onAdjust(product)}
								className='h-11 w-full sm:h-9 sm:w-auto'
							>
								{t('adjust')}
							</Button>
						</li>
					)
				})}
			</ul>

			{pagination && pagination.pages > 1 && (
				<div className='flex items-center justify-between border-t pt-4'>
					<Button
						variant='outline'
						size='sm'
						disabled={pagination.current <= 1}
						onClick={() => onPageChange(pagination.current - 1)}
					>
						{t('previous')}
					</Button>
					<span className='text-xs text-slate-500'>
						{t('page', {
							current: pagination.current,
							total: pagination.pages,
						})}
					</span>
					<Button
						variant='outline'
						size='sm'
						disabled={pagination.current >= pagination.pages}
						onClick={() => onPageChange(pagination.current + 1)}
					>
						{t('next')}
					</Button>
				</div>
			)}
		</div>
	)
}
