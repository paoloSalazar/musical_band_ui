/**
 * RBAC API Service
 * API functions for managing roles, permissions, and role-permission assignments
 */

import { apiClient, type ApiResponse } from './client';
import type { Role, RoleFormData } from '../types';

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
  update: async (name: string, data: Partial<RoleFormData>): Promise<ApiResponse<Role>> => {
    return apiClient.patch<Role>('/user-roles/', { name, ...data });
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
