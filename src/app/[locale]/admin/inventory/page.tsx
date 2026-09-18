'use client'

import { InventoryDashboard } from '@/components/inventory'
import AdminLayout from '@/components/shared/AdminLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'

export default function AdminInventoryPage() {
	return (
		<ProtectedRoute requiredRole='admin'>
			<AdminLayout>
				<div className='p-3 sm:p-6'>
					<InventoryDashboard />
				</div>
			</AdminLayout>
		</ProtectedRoute>
	)
}
