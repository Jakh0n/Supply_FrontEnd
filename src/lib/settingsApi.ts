import api from './api'

export interface Category {
	_id: string
	name: string
	value: string
	label: string
	description?: string
	isActive: boolean
	createdAt: string
	updatedAt: string
}

export interface Branch {
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

export interface CategoryFormData {
	name: string
	value: string
	description: string
}

export interface BranchFormData {
	name: string
	description: string
	address: string
	phone: string
	email: string
}

// ===== CATEGORIES API =====

export const getCategories = async (): Promise<{
	categories: Category[]
	total: number
}> => {
	const response = await api.get('/settings/categories')
	return response.data
}

export const getAllCategories = async (): Promise<{
	categories: Category[]
	total: number
}> => {
	const response = await api.get('/settings/categories/all')
	return response.data
}

export const getCategory = async (
	id: string
): Promise<{ category: Category }> => {
	const response = await api.get(`/settings/categories/${id}`)
	return response.data
}

export const createCategory = async (
	data: CategoryFormData
): Promise<{ message: string; category: Category }> => {
	const response = await api.post('/settings/categories', data)
	return response.data
}

export const updateCategory = async (
	id: string,
	data: Partial<CategoryFormData>
): Promise<{ message: string; category: Category }> => {
	const response = await api.put(`/settings/categories/${id}`, data)
	return response.data
}

export const deleteCategory = async (
	id: string
): Promise<{ message: string }> => {
	const response = await api.delete(`/settings/categories/${id}`)
	return response.data
}

export const toggleCategoryStatus = async (
	id: string
): Promise<{ message: string; category: Category }> => {
	const response = await api.patch(`/settings/categories/${id}/toggle-status`)
	return response.data
}

// ===== BRANCHES API =====

export const getBranches = async (): Promise<{
	branches: Branch[]
	total: number
}> => {
	const response = await api.get('/settings/branches')
	return response.data
}

export const getAllBranches = async (): Promise<{
	branches: Branch[]
	total: number
}> => {
	const response = await api.get('/settings/branches/all')
	return response.data
}

export const getBranch = async (id: string): Promise<{ branch: Branch }> => {
	const response = await api.get(`/settings/branches/${id}`)
	return response.data
}

export const createBranch = async (
	data: BranchFormData
): Promise<{ message: string; branch: Branch }> => {
	const response = await api.post('/settings/branches', data)
	return response.data
}

export const updateBranch = async (
	id: string,
	data: Partial<BranchFormData>
): Promise<{ message: string; branch: Branch }> => {
	const response = await api.put(`/settings/branches/${id}`, data)
	return response.data
}

export const deleteBranch = async (
	id: string
): Promise<{ message: string }> => {
	const response = await api.delete(`/settings/branches/${id}`)
	return response.data
}

export const toggleBranchStatus = async (
	id: string
): Promise<{ message: string; branch: Branch }> => {
	const response = await api.patch(`/settings/branches/${id}/toggle-status`)
	return response.data
}
