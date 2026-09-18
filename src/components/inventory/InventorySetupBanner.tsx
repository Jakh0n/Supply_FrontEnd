'use client'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useActivateInventory } from '@/hooks/queries'
import { InventorySettings } from '@/types'
import { useTranslations } from 'next-intl'

interface InventorySetupBannerProps {
	settings?: InventorySettings
	loading: boolean
	canActivate: boolean
}

export default function InventorySetupBanner({
	settings,
	loading,
	canActivate,
}: InventorySetupBannerProps) {
	const t = useTranslations('inventory')
	const activateMutation = useActivateInventory()

	if (loading) {
		return <Skeleton className='h-24 w-full' />
	}

	if (!settings || settings.status === 'active') {
		return null
	}

	const remaining = settings.remainingProducts
	const canStart =
		canActivate &&
		settings.totalProducts > 0 &&
		remaining === 0 &&
		!activateMutation.isPending

	return (
		<section className='space-y-3 border-l-2 border-amber-500 bg-amber-50/70 px-4 py-4'>
			<div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
				<div className='min-w-0'>
					<p className='text-sm font-semibold text-slate-950'>
						{t('setupTitle')}
					</p>
					<p className='mt-1 text-sm text-slate-600'>{t('setupBody')}</p>
					<p className='mt-2 text-sm tabular-nums text-slate-800'>
						{t('setupProgress', {
							initialized: settings.initializedProducts,
							total: settings.totalProducts,
						})}
					</p>
					{remaining > 0 && (
						<p className='mt-1 text-sm text-amber-800'>
							{t('setupRemaining', { count: remaining })}
						</p>
					)}
				</div>

				{canActivate && (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								disabled={!canStart}
								className='h-11 shrink-0 sm:h-10'
							>
								{t('startControl')}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>{t('startConfirmTitle')}</AlertDialogTitle>
								<AlertDialogDescription>
									{t('startConfirmBody')}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
								<AlertDialogAction
									disabled={activateMutation.isPending}
									onClick={event => {
										event.preventDefault()
										activateMutation.mutate()
									}}
								>
									{activateMutation.isPending
										? t('starting')
										: t('startControl')}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</div>
		</section>
	)
}
