'use client'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'

interface ProductSoldOutRowProps {
	available: boolean
	children: ReactNode
	controls?: ReactNode
	className?: string
}

export function ProductSoldOutRow({
	available,
	children,
	controls,
	className,
}: ProductSoldOutRowProps) {
	const t = useTranslations('worker.products')

	return (
		<div className={cn('relative', className)}>
			<div
				className={cn(
					!available && 'blur-[2px] opacity-60 pointer-events-none select-none'
				)}
			>
				{children}
			</div>
			{available ? (
				controls
			) : (
				<div className='mt-2 flex justify-center sm:justify-end'>
					<span className='text-[11px] sm:text-xs font-semibold text-red-800 bg-red-50 border border-red-200 rounded-md px-2.5 py-1 text-center leading-tight'>
						{t('outOfStock')}
					</span>
				</div>
			)}
		</div>
	)
}

export function ProductSoldOutInlineLabel() {
	const t = useTranslations('worker.products')

	return (
		<span className='text-xs font-semibold text-red-800 bg-red-50 border border-red-200 rounded-md px-2 py-1 whitespace-nowrap'>
			{t('outOfStock')}
		</span>
	)
}
