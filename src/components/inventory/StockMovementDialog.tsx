'use client'

import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { useCreateStockMovement } from '@/hooks/queries'
import { Product } from '@/types'
import { useTranslations } from 'next-intl'
import { FormEvent, useEffect, useState } from 'react'

interface StockMovementDialogProps {
	product: Product | null
	open: boolean
	canSetBalance: boolean
	onOpenChange: (open: boolean) => void
}

type MovementMode = 'in' | 'out' | 'set'

export default function StockMovementDialog({
	product,
	open,
	canSetBalance,
	onOpenChange,
}: StockMovementDialogProps) {
	const t = useTranslations('inventory')
	const mutation = useCreateStockMovement()
	const [mode, setMode] = useState<MovementMode>('in')
	const [value, setValue] = useState('')
	const [reason, setReason] = useState('')

	useEffect(() => {
		if (!open || !product) return
		const countingOpening = !product.inventoryInitialized && canSetBalance
		setMode(countingOpening ? 'set' : 'in')
		setValue(countingOpening ? String(product.amount ?? 0) : '')
		setReason(countingOpening ? t('openingBalanceReason') : '')
	}, [open, product, canSetBalance, t])

	if (!product) return null

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const parsedValue = Number(value)
		const invalidValue =
			!Number.isFinite(parsedValue) ||
			(mode === 'set' ? parsedValue < 0 : parsedValue <= 0)
		if (invalidValue || reason.trim().length < 3) {
			return
		}

		await mutation.mutateAsync({
			productId: product._id,
			mode,
			quantity: mode === 'set' ? undefined : parsedValue,
			targetBalance: mode === 'set' ? parsedValue : undefined,
			reason: reason.trim(),
		})
		onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<form onSubmit={handleSubmit} className='space-y-5'>
					<DialogHeader>
						<DialogTitle>{t('dialogTitle', { product: product.name })}</DialogTitle>
					</DialogHeader>

					<div className='rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600'>
						{t('onHand')}:{' '}
						<span className='font-semibold tabular-nums text-slate-950'>
							{product.amount} {product.unit}
						</span>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='movement-mode'>{t('mode')}</Label>
						<Select value={mode} onValueChange={value => setMode(value as MovementMode)}>
							<SelectTrigger id='movement-mode' className='h-11'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='in'>{t('receive')}</SelectItem>
								<SelectItem value='out'>{t('issue')}</SelectItem>
								{canSetBalance && (
									<SelectItem value='set'>{t('setBalance')}</SelectItem>
								)}
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='movement-quantity'>
							{mode === 'set' ? t('targetBalance') : t('quantity')} ({product.unit})
						</Label>
						<Input
							id='movement-quantity'
							type='number'
							min={mode === 'set' ? '0' : '0.000001'}
							step='any'
							required
							value={value}
							onChange={event => setValue(event.target.value)}
							className='h-11'
						/>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='movement-reason'>{t('reason')}</Label>
						<Input
							id='movement-reason'
							required
							minLength={3}
							maxLength={500}
							value={reason}
							onChange={event => setReason(event.target.value)}
							placeholder={t('reasonPlaceholder')}
							className='h-11'
						/>
					</div>

					<DialogFooter>
						<Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
							{t('cancel')}
						</Button>
						<Button type='submit' disabled={mutation.isPending}>
							{mutation.isPending ? t('saving') : t('save')}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
