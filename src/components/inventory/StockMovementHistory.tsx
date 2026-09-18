'use client'

import { Button } from '@/components/ui/button'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
	PaginationInfo,
	StockMovement,
	StockMovementFilters,
	StockMovementType,
} from '@/types'
import { useTranslations } from 'next-intl'

interface StockMovementHistoryProps {
	movements: StockMovement[]
	pagination?: PaginationInfo
	filters: StockMovementFilters
	loading: boolean
	onFiltersChange: (filters: StockMovementFilters) => void
}

const MOVEMENT_TYPES: StockMovementType[] = [
	'purchase-in',
	'order-out',
	'drink-order-out',
	'reversal-in',
	'reversal-out',
	'manual-in',
	'manual-out',
	'adjustment-in',
	'adjustment-out',
]

export default function StockMovementHistory({
	movements,
	pagination,
	filters,
	loading,
	onFiltersChange,
}: StockMovementHistoryProps) {
	const t = useTranslations('inventory')

	return (
		<div className='space-y-4'>
			<Select
				value={filters.type ?? 'all'}
				onValueChange={type =>
					onFiltersChange({
						...filters,
						type: type as StockMovementType | 'all',
						page: 1,
					})
				}
			>
				<SelectTrigger className='h-11 w-full sm:h-10 sm:w-56'>
					<SelectValue placeholder={t('movement')} />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value='all'>{t('history')}</SelectItem>
					{MOVEMENT_TYPES.map(type => (
						<SelectItem key={type} value={type}>
							{t(`types.${type}`)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{loading ? (
				<div className='space-y-2'>
					{Array.from({ length: 6 }, (_, index) => (
						<Skeleton key={index} className='h-16 w-full' />
					))}
				</div>
			) : movements.length === 0 ? (
				<div className='py-14 text-center text-sm text-slate-500'>
					{t('noMovements')}
				</div>
			) : (
				<ul className='divide-y divide-slate-100'>
					{movements.map(movement => (
						<li
							key={movement._id}
							className='grid gap-2 py-3 sm:grid-cols-[minmax(180px,1.5fr)_150px_100px_120px_minmax(180px,2fr)_160px] sm:items-center'
						>
							<div>
								<p className='text-sm font-medium text-slate-950'>
									{movement.product?.name ?? movement.productName}
								</p>
								<p className='text-xs text-slate-500 sm:hidden'>
									{t(`types.${movement.type}`)}
								</p>
							</div>
							<span className='hidden text-xs text-slate-600 sm:block'>
								{t(`types.${movement.type}`)}
							</span>
							<span
								className={`text-sm font-semibold tabular-nums ${
									movement.delta > 0 ? 'text-emerald-700' : 'text-red-700'
								}`}
							>
								{movement.delta > 0 ? '+' : ''}
								{movement.delta} {movement.product?.unit ?? movement.unit}
							</span>
							<span className='text-xs tabular-nums text-slate-600'>
								{t('balance')}: {movement.balanceAfter}
							</span>
							<p className='text-xs text-slate-600'>{movement.reason}</p>
							<div className='text-xs text-slate-500'>
								<p>{movement.createdBy?.username}</p>
								<time dateTime={movement.createdAt}>
									{new Date(movement.createdAt).toLocaleString()}
								</time>
							</div>
						</li>
					))}
				</ul>
			)}

			{pagination && pagination.pages > 1 && (
				<div className='flex items-center justify-between border-t pt-4'>
					<Button
						variant='outline'
						size='sm'
						disabled={pagination.current <= 1}
						onClick={() =>
							onFiltersChange({ ...filters, page: pagination.current - 1 })
						}
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
						onClick={() =>
							onFiltersChange({ ...filters, page: pagination.current + 1 })
						}
					>
						{t('next')}
					</Button>
				</div>
			)}
		</div>
	)
}
