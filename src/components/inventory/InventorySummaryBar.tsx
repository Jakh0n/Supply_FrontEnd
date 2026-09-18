'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { InventorySummary } from '@/types'
import { useTranslations } from 'next-intl'

interface InventorySummaryBarProps {
	summary?: InventorySummary
	loading: boolean
}

export default function InventorySummaryBar({
	summary,
	loading,
}: InventorySummaryBarProps) {
	const t = useTranslations('inventory')
	const metrics = [
		{ label: t('totalProducts'), value: summary?.totalProducts ?? 0 },
		{ label: t('lowStock'), value: summary?.lowStockProducts ?? 0 },
		{ label: t('outOfStock'), value: summary?.outOfStockProducts ?? 0 },
		{
			label: t('incoming24h'),
			value: summary?.incomingMovements24h ?? 0,
		},
		{
			label: t('outgoing24h'),
			value: summary?.outgoingMovements24h ?? 0,
		},
	]

	return (
		<section className='grid grid-cols-2 gap-x-5 gap-y-4 border-y border-slate-200 py-4 sm:grid-cols-5'>
			{metrics.map(metric => (
				<div key={metric.label} className='min-w-0'>
					<p className='truncate text-xs text-slate-500'>{metric.label}</p>
					{loading ? (
						<Skeleton className='mt-1 h-7 w-12' />
					) : (
						<p className='mt-0.5 text-2xl font-semibold tabular-nums text-slate-950'>
							{metric.value}
						</p>
					)}
				</div>
			))}
		</section>
	)
}
