/**
 * RBAC API Service
 * API functions for managing roles, permissions, and role-permission assignments
 */

import { apiClient, type ApiResponse } from './client';
import type { Role, RoleFormData, Permission, PermissionFormData } from '../types';

/**
 * Roles API
 * Endpoints: /api/user-roles/
 */
export const rolesApi = {
  /**
   * Get all roles
   * GET /api/user-roles/
   */
  list: async (): Promise<ApiResponse<Role[]>> => {
    return apiClient.get<Role[]>('/user-roles/');
  },

  /**
   * Get a role by name
   * GET /api/user-roles/{name}
   */
  getByName: async (name: string): Promise<ApiResponse<Role>> => {
    return apiClient.get<Role>(`/user-roles/${name}`);
  },

  /**
   * Create a new role
   * POST /api/user-roles/
   */
  create: async (data: RoleFormData): Promise<ApiResponse<Role>> => {
    return apiClient.post<Role>('/user-roles/', data);
  },

  /**
   * Update a role (partial update)
   * PATCH /api/user-roles/
   */
  update: async (id: number, data: Partial<RoleFormData>): Promise<ApiResponse<Role>> => {
    return apiClient.patch<Role>(`/user-roles/${id}`, data);
  },

  /**
   * Replace a role (full update)
   * PUT /api/user-roles/
   */
  replace: async (id: number, data: RoleFormData): Promise<ApiResponse<Role>> => {
    return apiClient.put<Role>('/user-roles/', { id, ...data });
  },

  /**
   * Delete a role by name
   * DELETE /api/user-roles/{name}
   */
  delete: async (name: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`/user-roles/${name}`);
  },
};

/**
 * Permissions API
 * Endpoints: /api/permissions/
 */
export const permissionsApi = {
  /**
   * Get all permissions
   * GET /api/permissions/
   */
  list: async (): Promise<ApiResponse<Permission[]>> => {
    return apiClient.get<Permission[]>('/permissions/');
  },

  /**
   * Get a permission by ID
   * GET /api/permissions/{id}
   */
  getById: async (id: number): Promise<ApiResponse<Permission>> => {
    return apiClient.get<Permission>(`/permissions/${id}`);
  },

  /**
   * Create a new permission
   * POST /api/permissions/
   */
  create: async (data: PermissionFormData): Promise<ApiResponse<Permission>> => {
    return apiClient.post<Permission>('/permissions/', data);
  },

  /**
   * Update a permission (partial update)
   * PATCH /api/permissions/{id}
   */
  update: async (id: number, data: Partial<PermissionFormData>): Promise<ApiResponse<Permission>> => {
    return apiClient.patch<Permission>(`/permissions/${id}`, data);
  },

  /**
   * Replace a permission (full update)
   * PUT /api/permissions/{id}
   */
  replace: async (id: number, data: PermissionFormData): Promise<ApiResponse<Permission>> => {
    return apiClient.put<Permission>(`/permissions/${id}`, data);
  },

  /**
   * Delete a permission by name
   * DELETE /api/permissions/{name}
   */
  deleteByName: async (name: string): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`/permissions/${name}`);
  },

  /**
   * Delete a permission by ID
   * DELETE /api/permissions/{id}
   */
  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`/permissions/${id}`);
  },
};
