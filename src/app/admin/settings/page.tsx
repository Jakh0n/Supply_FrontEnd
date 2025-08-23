'use client'

import AdminLayout from '@/components/shared/AdminLayout'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import * as settingsApi from '@/lib/settingsApi'
import { Building2, Edit, Package, Plus, Settings, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Category {
	_id: string
	name: string
	value: string
	label: string
	description?: string
	isActive: boolean
	createdAt: string
	updatedAt: string
}

interface Branch {
	_id: string
	name: string
	description?: string
	address?: string
	phone?: string
	email?: string
	isActive: boolean
	createdAt: string
	updatedAt: string
}

interface CategoryFormData {
	name: string
	value: string
	description: string
}

interface BranchFormData {
	name: string
	description: string
	address: string
	phone: string
	email: string
}

const SettingsPage: React.FC = () => {
	const [categories, setCategories] = useState<Category[]>([])
	const [branches, setBranches] = useState<Branch[]>([])
	const [loading, setLoading] = useState(true)

	// Category states
	const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
	const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false)
	const [editingCategory, setEditingCategory] = useState<Category | null>(null)
	const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
		name: '',
		value: '',
		description: '',
	})
	const [categoryLoading, setCategoryLoading] = useState(false)

	// Branch states
	const [isCreateBranchOpen, setIsCreateBranchOpen] = useState(false)
	const [isEditBranchOpen, setIsEditBranchOpen] = useState(false)
	const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
	const [branchFormData, setBranchFormData] = useState<BranchFormData>({
		name: '',
		description: '',
		address: '',
		phone: '',
		email: '',
	})
	const [branchLoading, setBranchLoading] = useState(false)

	// Fetch categories and branches
	const fetchData = useCallback(async () => {
		try {
			setLoading(true)
			const [categoriesResponse, branchesResponse] = await Promise.all([
				settingsApi.getAllCategories(),
				settingsApi.getAllBranches(),
			])

			setCategories(categoriesResponse.categories)
			setBranches(branchesResponse.branches)
		} catch (err) {
			console.error('Settings fetch error:', err)
			toast.error('Failed to load settings data')
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchData()
	}, [fetchData])

	// Category handlers
	const handleCreateCategory = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			setCategoryLoading(true)

			// Validate form data
			if (!categoryFormData.name.trim() || !categoryFormData.value.trim()) {
				toast.error('Name and value are required')
				return
			}

			// Check if value already exists
			if (categories.some(cat => cat.value === categoryFormData.value)) {
				toast.error('Category value already exists')
				return
			}

			const response = await settingsApi.createCategory(categoryFormData)

			setCategories(prev => [response.category, ...prev])
			setIsCreateCategoryOpen(false)
			resetCategoryForm()
			toast.success('Category created successfully')
		} catch (err) {
			toast.error('Failed to create category')
			console.error('Create category error:', err)
		} finally {
			setCategoryLoading(false)
		}
	}

	const handleEditCategory = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editingCategory) return

		try {
			setCategoryLoading(true)

			// Validate form data
			if (!categoryFormData.name.trim() || !categoryFormData.value.trim()) {
				toast.error('Name and value are required')
				return
			}

			// Check if value already exists (excluding current category)
			if (
				categories.some(
					cat =>
						cat.value === categoryFormData.value &&
						cat._id !== editingCategory._id
				)
			) {
				toast.error('Category value already exists')
				return
			}

			const response = await settingsApi.updateCategory(
				editingCategory._id,
				categoryFormData
			)

			setCategories(prev =>
				prev.map(cat =>
					cat._id === editingCategory._id ? response.category : cat
				)
			)
			setIsEditCategoryOpen(false)
			setEditingCategory(null)
			resetCategoryForm()
			toast.success('Category updated successfully')
		} catch (err) {
			toast.error('Failed to update category')
			console.error('Update category error:', err)
		} finally {
			setCategoryLoading(false)
		}
	}

	const handleDeleteCategory = async (categoryId: string) => {
		if (
			!confirm(
				'Are you sure you want to delete this category? This action cannot be undone.'
			)
		) {
			return
		}

		try {
			await settingsApi.deleteCategory(categoryId)

			setCategories(prev => prev.filter(cat => cat._id !== categoryId))
			toast.success('Category deleted successfully')
		} catch (err) {
			toast.error('Failed to delete category')
			console.error('Delete category error:', err)
		}
	}

	const openEditCategory = (category: Category) => {
		setEditingCategory(category)
		setCategoryFormData({
			name: category.name,
			value: category.value,
			description: category.description || '',
		})
		setIsEditCategoryOpen(true)
	}

	const resetCategoryForm = () => {
		setCategoryFormData({
			name: '',
			value: '',
			description: '',
		})
	}

	// Branch handlers
	const handleCreateBranch = async (e: React.FormEvent) => {
		e.preventDefault()
		try {
			setBranchLoading(true)

			// Validate form data
			if (!branchFormData.name.trim()) {
				toast.error('Branch name is required')
				return
			}

			// Check if name already exists
			if (
				branches.some(
					branch =>
						branch.name.toLowerCase() === branchFormData.name.toLowerCase()
				)
			) {
				toast.error('Branch name already exists')
				return
			}

			const response = await settingsApi.createBranch(branchFormData)

			setBranches(prev => [response.branch, ...prev])
			setIsCreateBranchOpen(false)
			resetBranchForm()
			toast.success('Branch created successfully')
		} catch (err) {
			toast.error('Failed to create branch')
			console.error('Create branch error:', err)
		} finally {
			setBranchLoading(false)
		}
	}

	const handleEditBranch = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editingBranch) return

		try {
			setBranchLoading(true)

			// Validate form data
			if (!branchFormData.name.trim()) {
				toast.error('Branch name is required')
				return
			}

			// Check if name already exists (excluding current branch)
			if (
				branches.some(
					branch =>
						branch.name.toLowerCase() === branchFormData.name.toLowerCase() &&
						branch._id !== editingBranch._id
				)
			) {
				toast.error('Branch name already exists')
				return
			}

			const response = await settingsApi.updateBranch(
				editingBranch._id,
				branchFormData
			)

			setBranches(prev =>
				prev.map(branch =>
					branch._id === editingBranch._id ? response.branch : branch
				)
			)
			setIsEditBranchOpen(false)
			setEditingBranch(null)
			resetBranchForm()
			toast.success('Branch updated successfully')
		} catch (err) {
			toast.error('Failed to update branch')
			console.error('Update branch error:', err)
		} finally {
			setBranchLoading(false)
		}
	}

	const handleDeleteBranch = async (branchId: string) => {
		if (
			!confirm(
				'Are you sure you want to delete this branch? This action cannot be undone.'
			)
		) {
			return
		}

		try {
			await settingsApi.deleteBranch(branchId)

			setBranches(prev => prev.filter(branch => branch._id !== branchId))
			toast.success('Branch deleted successfully')
		} catch (err) {
			toast.error('Failed to delete branch')
			console.error('Delete branch error:', err)
		}
	}

	const openEditBranch = (branch: Branch) => {
		setEditingBranch(branch)
		setBranchFormData({
			name: branch.name,
			description: branch.description || '',
			address: branch.address || '',
			phone: branch.phone || '',
			email: branch.email || '',
		})
		setIsEditBranchOpen(true)
	}

	const resetBranchForm = () => {
		setBranchFormData({
			name: '',
			description: '',
			address: '',
			phone: '',
			email: '',
		})
	}

	if (loading) {
		return (
			<ProtectedRoute requiredRole='admin'>
				<AdminLayout>
					<div className='flex items-center justify-center h-64'>
						<div className='text-center'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
							<p className='mt-4 text-gray-600'>Loading settings...</p>
						</div>
					</div>
				</AdminLayout>
			</ProtectedRoute>
		)
	}

	return (
		<ProtectedRoute requiredRole='admin'>
			<AdminLayout>
				<div className='space-y-6'>
					{/* Header */}
					<div className='flex items-center gap-3'>
						<Settings className='h-8 w-8 text-blue-600' />
						<div>
							<h1 className='text-2xl font-bold text-gray-900'>Settings</h1>
							<p className='text-gray-600'>Manage categories and branches</p>
						</div>
					</div>

					{/* Tabs */}
					<Tabs defaultValue='categories' className='space-y-6'>
						<TabsList className='grid w-full grid-cols-2'>
							<TabsTrigger
								value='categories'
								className='flex items-center gap-2'
							>
								<Package className='h-4 w-4' />
								Categories
							</TabsTrigger>
							<TabsTrigger value='branches' className='flex items-center gap-2'>
								<Building2 className='h-4 w-4' />
								Branches
							</TabsTrigger>
						</TabsList>

						{/* Categories Tab */}
						<TabsContent value='categories' className='space-y-6'>
							<div className='flex justify-between items-center'>
								<div>
									<h2 className='text-xl font-semibold text-gray-900'>
										Product Categories
									</h2>
									<p className='text-gray-600'>
										Manage product categories for your inventory
									</p>
								</div>
								<Dialog
									open={isCreateCategoryOpen}
									onOpenChange={setIsCreateCategoryOpen}
								>
									<DialogTrigger asChild>
										<Button onClick={resetCategoryForm}>
											<Plus className='h-4 w-4 mr-2' />
											Add Category
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Create New Category</DialogTitle>
											<DialogDescription>
												Add a new product category to your inventory system.
											</DialogDescription>
										</DialogHeader>
										<form onSubmit={handleCreateCategory} className='space-y-4'>
											<div>
												<Label htmlFor='category-name'>Name *</Label>
												<Input
													id='category-name'
													value={categoryFormData.name}
													onChange={e =>
														setCategoryFormData(prev => ({
															...prev,
															name: e.target.value,
														}))
													}
													placeholder='e.g., Frozen Products'
													required
												/>
											</div>
											<div>
												<Label htmlFor='category-value'>Value *</Label>
												<Input
													id='category-value'
													value={categoryFormData.value}
													onChange={e =>
														setCategoryFormData(prev => ({
															...prev,
															value: e.target.value,
														}))
													}
													placeholder='e.g., frozen-products'
													required
												/>
												<p className='text-sm text-gray-500 mt-1'>
													Use lowercase with hyphens (e.g., frozen-products)
												</p>
											</div>
											<div>
												<Label htmlFor='category-description'>
													Description
												</Label>
												<Input
													id='category-description'
													value={categoryFormData.description}
													onChange={e =>
														setCategoryFormData(prev => ({
															...prev,
															description: e.target.value,
														}))
													}
													placeholder='Brief description of the category'
												/>
											</div>
											<div className='flex justify-end gap-2'>
												<Button
													type='button'
													variant='outline'
													onClick={() => setIsCreateCategoryOpen(false)}
												>
													Cancel
												</Button>
												<Button type='submit' disabled={categoryLoading}>
													{categoryLoading ? 'Creating...' : 'Create Category'}
												</Button>
											</div>
										</form>
									</DialogContent>
								</Dialog>
							</div>

							{/* Categories List */}
							<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
								{categories.map(category => (
									<Card key={category._id}>
										<CardHeader className='pb-3'>
											<div className='flex justify-between items-start'>
												<div>
													<CardTitle className='text-lg'>
														{category.name}
													</CardTitle>
													<CardDescription className='text-sm'>
														{category.value}
													</CardDescription>
												</div>
												<Badge
													variant={category.isActive ? 'default' : 'secondary'}
												>
													{category.isActive ? 'Active' : 'Inactive'}
												</Badge>
											</div>
										</CardHeader>
										<CardContent>
											{category.description && (
												<p className='text-sm text-gray-600 mb-4'>
													{category.description}
												</p>
											)}
											<div className='flex gap-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => openEditCategory(category)}
												>
													<Edit className='h-4 w-4 mr-1' />
													Edit
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleDeleteCategory(category._id)}
												>
													<Trash2 className='h-4 w-4 mr-1' />
													Delete
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</TabsContent>

						{/* Branches Tab */}
						<TabsContent value='branches' className='space-y-6'>
							<div className='flex justify-between items-center'>
								<div>
									<h2 className='text-xl font-semibold text-gray-900'>
										Restaurant Branches
									</h2>
									<p className='text-gray-600'>
										Manage your restaurant locations
									</p>
								</div>
								<Dialog
									open={isCreateBranchOpen}
									onOpenChange={setIsCreateBranchOpen}
								>
									<DialogTrigger asChild>
										<Button onClick={resetBranchForm}>
											<Plus className='h-4 w-4 mr-2' />
											Add Branch
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>Create New Branch</DialogTitle>
											<DialogDescription>
												Add a new restaurant branch location.
											</DialogDescription>
										</DialogHeader>
										<form onSubmit={handleCreateBranch} className='space-y-4'>
											<div>
												<Label htmlFor='branch-name'>Name *</Label>
												<Input
													id='branch-name'
													value={branchFormData.name}
													onChange={e =>
														setBranchFormData(prev => ({
															...prev,
															name: e.target.value,
														}))
													}
													placeholder='e.g., Main Branch'
													required
												/>
											</div>
											<div>
												<Label htmlFor='branch-description'>Description</Label>
												<Input
													id='branch-description'
													value={branchFormData.description}
													onChange={e =>
														setBranchFormData(prev => ({
															...prev,
															description: e.target.value,
														}))
													}
													placeholder='Brief description of the branch'
												/>
											</div>
											<div>
												<Label htmlFor='branch-address'>Address</Label>
												<Input
													id='branch-address'
													value={branchFormData.address}
													onChange={e =>
														setBranchFormData(prev => ({
															...prev,
															address: e.target.value,
														}))
													}
													placeholder='Branch address'
												/>
											</div>
											<div>
												<Label htmlFor='branch-phone'>Phone</Label>
												<Input
													id='branch-phone'
													value={branchFormData.phone}
													onChange={e =>
														setBranchFormData(prev => ({
															...prev,
															phone: e.target.value,
														}))
													}
													placeholder='Branch phone number'
												/>
											</div>
											<div>
												<Label htmlFor='branch-email'>Email</Label>
												<Input
													id='branch-email'
													type='email'
													value={branchFormData.email}
													onChange={e =>
														setBranchFormData(prev => ({
															...prev,
															email: e.target.value,
														}))
													}
													placeholder='Branch email address'
												/>
											</div>
											<div className='flex justify-end gap-2'>
												<Button
													type='button'
													variant='outline'
													onClick={() => setIsCreateBranchOpen(false)}
												>
													Cancel
												</Button>
												<Button type='submit' disabled={branchLoading}>
													{branchLoading ? 'Creating...' : 'Create Branch'}
												</Button>
											</div>
										</form>
									</DialogContent>
								</Dialog>
							</div>

							{/* Branches List */}
							<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
								{branches.map(branch => (
									<Card key={branch._id}>
										<CardHeader className='pb-3'>
											<div className='flex justify-between items-start'>
												<div>
													<CardTitle className='text-lg'>
														{branch.name}
													</CardTitle>
													{branch.description && (
														<CardDescription className='text-sm'>
															{branch.description}
														</CardDescription>
													)}
												</div>
												<Badge
													variant={branch.isActive ? 'default' : 'secondary'}
												>
													{branch.isActive ? 'Active' : 'Inactive'}
												</Badge>
											</div>
										</CardHeader>
										<CardContent>
											<div className='space-y-2 mb-4'>
												{branch.address && (
													<p className='text-sm text-gray-600'>
														📍 {branch.address}
													</p>
												)}
												{branch.phone && (
													<p className='text-sm text-gray-600'>
														📞 {branch.phone}
													</p>
												)}
												{branch.email && (
													<p className='text-sm text-gray-600'>
														✉️ {branch.email}
													</p>
												)}
											</div>
											<div className='flex gap-2'>
												<Button
													variant='outline'
													size='sm'
													onClick={() => openEditBranch(branch)}
												>
													<Edit className='h-4 w-4 mr-1' />
													Edit
												</Button>
												<Button
													variant='outline'
													size='sm'
													onClick={() => handleDeleteBranch(branch._id)}
												>
													<Trash2 className='h-4 w-4 mr-1' />
													Delete
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</TabsContent>
					</Tabs>

					{/* Edit Category Dialog */}
					<Dialog
						open={isEditCategoryOpen}
						onOpenChange={setIsEditCategoryOpen}
					>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit Category</DialogTitle>
								<DialogDescription>
									Update the category information.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleEditCategory} className='space-y-4'>
								<div>
									<Label htmlFor='edit-category-name'>Name *</Label>
									<Input
										id='edit-category-name'
										value={categoryFormData.name}
										onChange={e =>
											setCategoryFormData(prev => ({
												...prev,
												name: e.target.value,
											}))
										}
										placeholder='e.g., Frozen Products'
										required
									/>
								</div>
								<div>
									<Label htmlFor='edit-category-value'>Value *</Label>
									<Input
										id='edit-category-value'
										value={categoryFormData.value}
										onChange={e =>
											setCategoryFormData(prev => ({
												...prev,
												value: e.target.value,
											}))
										}
										placeholder='e.g., frozen-products'
										required
									/>
									<p className='text-sm text-gray-500 mt-1'>
										Use lowercase with hyphens (e.g., frozen-products)
									</p>
								</div>
								<div>
									<Label htmlFor='edit-category-description'>Description</Label>
									<Input
										id='edit-category-description'
										value={categoryFormData.description}
										onChange={e =>
											setCategoryFormData(prev => ({
												...prev,
												description: e.target.value,
											}))
										}
										placeholder='Brief description of the category'
									/>
								</div>
								<div className='flex justify-end gap-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsEditCategoryOpen(false)}
									>
										Cancel
									</Button>
									<Button type='submit' disabled={categoryLoading}>
										{categoryLoading ? 'Updating...' : 'Update Category'}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>

					{/* Edit Branch Dialog */}
					<Dialog open={isEditBranchOpen} onOpenChange={setIsEditBranchOpen}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Edit Branch</DialogTitle>
								<DialogDescription>
									Update the branch information.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleEditBranch} className='space-y-4'>
								<div>
									<Label htmlFor='edit-branch-name'>Name *</Label>
									<Input
										id='edit-branch-name'
										value={branchFormData.name}
										onChange={e =>
											setBranchFormData(prev => ({
												...prev,
												name: e.target.value,
											}))
										}
										placeholder='e.g., Main Branch'
										required
									/>
								</div>
								<div>
									<Label htmlFor='edit-branch-description'>Description</Label>
									<Input
										id='edit-branch-description'
										value={branchFormData.description}
										onChange={e =>
											setBranchFormData(prev => ({
												...prev,
												description: e.target.value,
											}))
										}
										placeholder='Brief description of the branch'
									/>
								</div>
								<div>
									<Label htmlFor='edit-branch-address'>Address</Label>
									<Input
										id='edit-branch-address'
										value={branchFormData.address}
										onChange={e =>
											setBranchFormData(prev => ({
												...prev,
												address: e.target.value,
											}))
										}
										placeholder='Branch address'
									/>
								</div>
								<div>
									<Label htmlFor='edit-branch-phone'>Phone</Label>
									<Input
										id='edit-branch-phone'
										value={branchFormData.phone}
										onChange={e =>
											setBranchFormData(prev => ({
												...prev,
												phone: e.target.value,
											}))
										}
										placeholder='Branch phone number'
									/>
								</div>
								<div>
									<Label htmlFor='edit-branch-email'>Email</Label>
									<Input
										id='edit-branch-email'
										type='email'
										value={branchFormData.email}
										onChange={e =>
											setBranchFormData(prev => ({
												...prev,
												email: e.target.value,
											}))
										}
										placeholder='Branch email address'
									/>
								</div>
								<div className='flex justify-end gap-2'>
									<Button
										type='button'
										variant='outline'
										onClick={() => setIsEditBranchOpen(false)}
									>
										Cancel
									</Button>
									<Button type='submit' disabled={branchLoading}>
										{branchLoading ? 'Updating...' : 'Update Branch'}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</AdminLayout>
		</ProtectedRoute>
	)
}

export default SettingsPage
