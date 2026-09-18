'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	DrinkOrder,
	Order,
	OrderItemReceiptStatus,
	SubmitOrderReceiptInput,
} from '@/types'
import { AlertTriangle, CheckCircle2, ClipboardCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import axios from 'axios'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

type ReceiptOrder = Order | DrinkOrder

interface ReceiptLineState {
	productId: string
	productName: string
	unit: string
	orderedQuantity: number
	receivedQuantity: number
	discrepancyNotes: string
}

interface OrderReceiptCheckProps {
	order: ReceiptOrder
	onSubmit: (
		input: SubmitOrderReceiptInput
	) => Promise<{ message: string; order: ReceiptOrder }>
	onSuccess: (order: ReceiptOrder) => void
}

function buildInitialLines(order: ReceiptOrder): ReceiptLineState[] {
	return order.items
		.filter(item => item.product?._id)
		.map(item => ({
			productId: item.product._id,
			productName: item.product.name,
			unit: item.product.unit,
			orderedQuantity: item.quantity,
			receivedQuantity: item.quantity,
			discrepancyNotes: '',
		}))
}

function getItemReceiptLabel(
	status: OrderItemReceiptStatus | undefined,
	t: ReturnType<typeof useTranslations>
) {
	switch (status) {
		case 'received':
			return t('itemReceived')
		case 'partial':
			return t('itemPartial')
		case 'missing':
			return t('itemMissing')
		default:
			return t('itemPending')
	}
}

export default function OrderReceiptCheck({
	order,
	onSubmit,
	onSuccess,
}: OrderReceiptCheckProps) {
	const t = useTranslations('worker.receipt')
	const [lines, setLines] = useState<ReceiptLineState[]>(() =>
		buildInitialLines(order)
	)
	const [receiptNotes, setReceiptNotes] = useState('')
	const [submitting, setSubmitting] = useState(false)

	const canCheck =
		order.status === 'completed' && (order.receiptStatus ?? 'pending') === 'pending'

	const hasShortage = useMemo(
		() => lines.some(line => line.receivedQuantity < line.orderedQuantity),
		[lines]
	)

	const updateLine = (
		productId: string,
		updates: Partial<Pick<ReceiptLineState, 'receivedQuantity' | 'discrepancyNotes'>>
	) => {
		setLines(current =>
			current.map(line =>
				line.productId === productId ? { ...line, ...updates } : line
			)
		)
	}

	const handleSubmit = async () => {
		for (const line of lines) {
			if (line.receivedQuantity < 0) {
				toast.error(t('invalidQuantity'))
				return
			}
			if (line.receivedQuantity > line.orderedQuantity) {
				toast.error(t('quantityTooHigh', { name: line.productName }))
				return
			}
			if (
				line.receivedQuantity < line.orderedQuantity &&
				!line.discrepancyNotes.trim()
			) {
				toast.error(t('notesRequired', { name: line.productName }))
				return
			}
		}

		try {
			setSubmitting(true)
			const payload: SubmitOrderReceiptInput = {
				items: lines.map(line => ({
					productId: line.productId,
					receivedQuantity: line.receivedQuantity,
					discrepancyNotes: line.discrepancyNotes.trim() || undefined,
				})),
				receiptNotes: receiptNotes.trim() || undefined,
			}
			const response = await onSubmit(payload)
			toast.success(response.message)
			onSuccess(response.order)
		} catch (error: unknown) {
			const message = axios.isAxiosError<{ message?: string }>(error)
				? error.response?.data?.message || t('submitFailed')
				: t('submitFailed')
			toast.error(message)
		} finally {
			setSubmitting(false)
		}
	}

	if (!canCheck && (order.receiptStatus ?? 'pending') !== 'pending') {
		return (
			<section className='space-y-4 border-y border-slate-200 py-4'>
				<div className='flex items-start gap-3'>
					<ClipboardCheck className='mt-0.5 h-5 w-5 shrink-0 text-slate-500' />
					<div className='min-w-0 flex-1'>
						<h2 className='text-base font-semibold text-slate-950'>
							{t('checkedTitle')}
						</h2>
						<p className='mt-1 text-sm text-slate-600'>
							{order.receiptStatus === 'received'
								? t('checkedAllReceived')
								: t('checkedWithIssues')}
						</p>
						{order.checkedBy && order.checkedAt && (
							<p className='mt-2 text-sm text-slate-500'>
								{t('checkedBy', {
									name: order.checkedBy.username,
									date: new Date(order.checkedAt).toLocaleString(),
								})}
							</p>
						)}
					</div>
				</div>

				<div className='space-y-2'>
					{order.items.map(item => {
						if (!item.product?._id) return null
						const status = item.itemReceiptStatus ?? 'pending'
						const isIssue = status === 'partial' || status === 'missing'

						return (
							<div
								key={item.product._id}
								className={`flex flex-col gap-2 border-l-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between ${
									isIssue
										? 'border-amber-500 bg-amber-50/60'
										: 'border-emerald-500 bg-emerald-50/40'
								}`}
							>
								<div className='min-w-0'>
									<p className='font-medium text-slate-950'>{item.product.name}</p>
									<p className='text-sm text-slate-600'>
										{t('receivedOfOrdered', {
											received: item.receivedQuantity ?? 0,
											ordered: item.quantity,
											unit: item.product.unit,
										})}
									</p>
									{item.discrepancyNotes && (
										<p className='mt-1 text-sm text-amber-800'>
											{item.discrepancyNotes}
										</p>
									)}
								</div>
								<span
									className={`text-xs font-medium ${
										isIssue ? 'text-amber-800' : 'text-emerald-800'
									}`}
								>
									{getItemReceiptLabel(status, t)}
								</span>
							</div>
						)
					})}
				</div>

				{order.receiptNotes && (
					<div className='rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700'>
						<p className='font-medium text-slate-900'>{t('receiptNotes')}</p>
						<p className='mt-1'>{order.receiptNotes}</p>
					</div>
				)}
			</section>
		)
	}

	if (!canCheck) {
		return null
	}

	return (
		<section className='space-y-4 border-y border-slate-200 py-4'>
			<div className='flex items-start gap-3'>
				<ClipboardCheck className='mt-0.5 h-5 w-5 shrink-0 text-slate-700' />
				<div>
					<h2 className='text-base font-semibold text-slate-950'>
						{t('checkTitle')}
					</h2>
					<p className='mt-1 text-sm text-slate-600'>{t('checkDescription')}</p>
				</div>
			</div>

			<div className='space-y-3'>
				{lines.map(line => {
					const isShort =
						line.receivedQuantity < line.orderedQuantity ||
						line.receivedQuantity === 0

					return (
						<div
							key={line.productId}
							className='space-y-3 border-l-2 border-slate-200 px-3 py-2'
						>
							<div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
								<div className='min-w-0'>
									<p className='font-medium text-slate-950'>{line.productName}</p>
									<p className='text-sm text-slate-500'>
										{t('orderedQuantity', {
											quantity: line.orderedQuantity,
											unit: line.unit,
										})}
									</p>
								</div>
								<div className='flex flex-wrap gap-2'>
									<Button
										type='button'
										size='sm'
										variant='outline'
										className='h-9'
										onClick={() =>
											updateLine(line.productId, {
												receivedQuantity: line.orderedQuantity,
												discrepancyNotes: '',
											})
										}
									>
										<CheckCircle2 className='mr-1 h-4 w-4' />
										{t('markAllReceived')}
									</Button>
									<Button
										type='button'
										size='sm'
										variant='outline'
										className='h-9 text-red-700'
										onClick={() =>
											updateLine(line.productId, {
												receivedQuantity: 0,
											})
										}
									>
										<AlertTriangle className='mr-1 h-4 w-4' />
										{t('markMissing')}
									</Button>
								</div>
							</div>

							<div className='grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-end'>
								<div>
									<Label htmlFor={`received-${line.productId}`} className='text-sm'>
										{t('receivedQuantity')}
									</Label>
									<Input
										id={`received-${line.productId}`}
										type='number'
										min={0}
										max={line.orderedQuantity}
										value={line.receivedQuantity}
										onChange={event =>
											updateLine(line.productId, {
												receivedQuantity: Number(event.target.value),
											})
										}
										className='mt-1 h-11 sm:h-10'
									/>
								</div>
								{isShort && (
									<div>
										<Label
											htmlFor={`notes-${line.productId}`}
											className='text-sm text-amber-800'
										>
											{t('discrepancyNotes')}
										</Label>
										<Input
											id={`notes-${line.productId}`}
											value={line.discrepancyNotes}
											onChange={event =>
												updateLine(line.productId, {
													discrepancyNotes: event.target.value,
												})
											}
											placeholder={t('discrepancyPlaceholder')}
											className='mt-1 h-11 sm:h-10'
										/>
									</div>
								)}
							</div>
						</div>
					)
				})}
			</div>

			<div>
				<Label htmlFor='receipt-notes' className='text-sm'>
					{t('receiptNotes')}
				</Label>
				<textarea
					id='receipt-notes'
					value={receiptNotes}
					onChange={event => setReceiptNotes(event.target.value)}
					placeholder={t('receiptNotesPlaceholder')}
					className='mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
				/>
			</div>

			<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
				{hasShortage ? (
					<p className='text-sm text-amber-800'>{t('shortageWarning')}</p>
				) : (
					<p className='text-sm text-slate-500'>{t('allReceivedHint')}</p>
				)}
				<Button
					type='button'
					onClick={handleSubmit}
					disabled={submitting}
					className='h-11 sm:h-10 sm:min-w-[180px]'
				>
					{submitting ? t('submitting') : t('submitReceipt')}
				</Button>
			</div>
		</section>
	)
}
