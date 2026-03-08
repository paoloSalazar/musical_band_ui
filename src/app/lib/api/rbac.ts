/**
 * RBAC API Service
 * API functions for managing roles, permissions, and role-permission assignments
 */

import { apiClient, type ApiResponse } from './client';
import type { Role, RoleFormData, Permission, PermissionFormData, User, UserFormData } from '../types';

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
   * Get all permissions with pagination
   * GET /api/permissions/?skip=0&limit=8
   * Response: { data: Permission[], total: number, skip: number, limit: number }
   */
  list: async (skip = 0, limit = 8): Promise<ApiResponse<{ data: Permission[], total: number, skip: number, limit: number }>> => {
    return apiClient.get<{ data: Permission[], total: number, skip: number, limit: number }>(`/permissions/?skip=${skip}&limit=${limit}`);
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

  /**
   * Get permissions for a role
   * GET /api/permissions/{role_name}/permissions
   */
  getPermissionsForRole: async (roleName: string): Promise<ApiResponse<Permission[]>> => {
    return apiClient.get<Permission[]>(`/permissions/${roleName}/permissions`);
  },

  /**
   * Assign permission to role
   * POST /api/permissions/roles/assign?permission_name=X&role_name=Y
   */
  assignToRole: async (permissionName: string, roleName: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/permissions/roles/assign?permission_name=${permissionName}&role_name=${roleName}`
    );
  },

  /**
   * Remove permission from role
   * POST /api/permissions/roles/remove?permission_name=X&role_name=Y
   */
  removeFromRole: async (permissionName: string, roleName: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    return apiClient.post<{ success: boolean; message: string }>(
      `/permissions/roles/remove?permission_name=${permissionName}&role_name=${roleName}`
    );
  },
};

/**
 * Users API
 * Endpoints: /api/users/
 */
export const usersApi = {
  /**
   * Get all users with pagination
   * GET /api/users/?skip=0&limit=10
   * Response: { data: User[], total: number, skip: number, limit: number }
   */
  list: async (skip = 0, limit = 10): Promise<ApiResponse<{ data: User[], total: number, skip: number, limit: number }>> => {
    return apiClient.get<{ data: User[], total: number, skip: number, limit: number }>(`/users/?skip=${skip}&limit=${limit}`);
  },

  /**
   * Get a user by ID
   * GET /api/users/{id}
   */
  getById: async (id: number): Promise<ApiResponse<User>> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  /**
   * Create a new user
   * POST /api/users/
   */
  create: async (data: UserFormData): Promise<ApiResponse<User>> => {
    return apiClient.post<User>('/users/', data);
  },

  /**
   * Update a user (partial update)
   * PATCH /api/users/{id}
   */
  update: async (id: number, data: Partial<UserFormData>): Promise<ApiResponse<User>> => {
    return apiClient.patch<User>(`/users/${id}`, data);
  },

  /**
   * Replace a user (full update)
   * PUT /api/users/{id}
   */
  replace: async (id: number, data: UserFormData): Promise<ApiResponse<User>> => {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  /**
   * Delete a user by ID
   * DELETE /api/users/{id}
   */
  delete: async (id: number): Promise<ApiResponse<boolean>> => {
    return apiClient.delete<boolean>(`/users/${id}`);
  },
};
