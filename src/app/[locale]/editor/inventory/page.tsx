'use client'

import { InventoryDashboard } from '@/components/inventory'
import EditorShell from '@/components/editor/EditorShell'
import { useAuth } from '@/contexts/AuthContext'

export default function EditorInventoryPage() {
	const { user, logout } = useAuth()

	if (!user) return null

	return (
		<EditorShell username={user.username} onLogout={logout}>
			<InventoryDashboard />
		</EditorShell>
	)
}
