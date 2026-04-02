/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rolesApi, permissionsApi, usersApi } from '@/app/lib/api/rbac';
import { apiClient } from '@/app/lib/api/client';
import type { Role, RoleFormData, Permission, PermissionFormData, User, UserFormData } from '@/app/lib/types';

describe('rbac API', () => {
  let mockGet: ReturnType<typeof vi.fn>;
  let mockPost: ReturnType<typeof vi.fn>;
  let mockPatch: ReturnType<typeof vi.fn>;
  let mockPut: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGet = vi.fn();
    mockPost = vi.fn();
    mockPatch = vi.fn();
    mockPut = vi.fn();
    mockDelete = vi.fn();
    
    (apiClient as any).get = mockGet;
    (apiClient as any).post = mockPost;
    (apiClient as any).patch = mockPatch;
    (apiClient as any).put = mockPut;
    (apiClient as any).delete = mockDelete;
  });

  // ============ Roles API ============
  describe('rolesApi', () => {
    describe('list', () => {
      it('should fetch all roles', async () => {
        const mockRoles: Role[] = [
          { id: 1, name: 'admin', description: 'Administrator' },
          { id: 2, name: 'user', description: 'Regular user' },
        ];

        mockGet.mockResolvedValue({
          data: mockRoles,
          success: true,
        });

        const result = await rolesApi.list();

        expect(mockGet).toHaveBeenCalledWith('/user-roles/');
        expect(result.data).toHaveLength(2);
      });
    });

    describe('getByName', () => {
      it('should fetch a role by name', async () => {
        const mockRole: Role = { id: 1, name: 'admin', description: 'Administrator' };

        mockGet.mockResolvedValue({
          data: mockRole,
          success: true,
        });

        const result = await rolesApi.getByName('admin');

        expect(mockGet).toHaveBeenCalledWith('/user-roles/admin');
        expect(result.data.name).toBe('admin');
      });
    });

    describe('create', () => {
      it('should create a new role', async () => {
        const roleData: RoleFormData = { name: 'new_role', description: 'New role' };
        const createdRole: Role = { id: 3, ...roleData };

        mockPost.mockResolvedValue({
          data: createdRole,
          success: true,
        });

        const result = await rolesApi.create(roleData);

        expect(mockPost).toHaveBeenCalledWith('/user-roles/', roleData);
        expect(result.data.id).toBe(3);
      });
    });

    describe('update', () => {
      it('should update a role (partial)', async () => {
        const updateData: Partial<RoleFormData> = { description: 'Updated description' };
        const updatedRole: Role = { id: 1, name: 'admin', description: 'Updated description' };

        mockPatch.mockResolvedValue({
          data: updatedRole,
          success: true,
        });

        const result = await rolesApi.update(1, updateData);

        expect(mockPatch).toHaveBeenCalledWith('/user-roles/1', updateData);
        expect(result.data.description).toBe('Updated description');
      });
    });

    describe('replace', () => {
      it('should replace a role (full update)', async () => {
        const roleData: RoleFormData = { name: 'admin', description: 'Full update' };

        mockPut.mockResolvedValue({
          data: { id: 1, ...roleData } as Role,
          success: true,
        });

        const result = await rolesApi.replace(1, roleData);

        expect(mockPut).toHaveBeenCalledWith('/user-roles/', { id: 1, ...roleData });
      });
    });

    describe('delete', () => {
      it('should delete a role by name', async () => {
        mockDelete.mockResolvedValue({
          data: true,
          success: true,
        });

        const result = await rolesApi.delete('admin');

        expect(mockDelete).toHaveBeenCalledWith('/user-roles/admin');
        expect(result.data).toBe(true);
      });
    });
  });

  // ============ Permissions API ============
  describe('permissionsApi', () => {
    describe('list', () => {
      it('should fetch paginated permissions', async () => {
        const mockPermissions: Permission[] = [
          { id: 1, name: 'read_events', description: 'Read events' },
          { id: 2, name: 'write_events', description: 'Write events' },
        ];

        mockGet.mockResolvedValue({
          data: { data: mockPermissions, total: 2, skip: 0, limit: 8 },
          success: true,
        });

        const result = await permissionsApi.list();

        expect(mockGet).toHaveBeenCalledWith('/permissions/?skip=0&limit=8');
        expect(result.data.data).toHaveLength(2);
      });

      it('should fetch with custom pagination', async () => {
        mockGet.mockResolvedValue({
          data: { data: [], total: 0, skip: 10, limit: 20 },
          success: true,
        });

        await permissionsApi.list(10, 20);

        expect(mockGet).toHaveBeenCalledWith('/permissions/?skip=10&limit=20');
      });
    });

    describe('getById', () => {
      it('should fetch a permission by ID', async () => {
        const mockPermission: Permission = { id: 1, name: 'read_events' };

        mockGet.mockResolvedValue({
          data: mockPermission,
          success: true,
        });

        const result = await permissionsApi.getById(1);

        expect(mockGet).toHaveBeenCalledWith('/permissions/1');
        expect(result.data.name).toBe('read_events');
      });
    });

    describe('create', () => {
      it('should create a new permission', async () => {
        const permData: PermissionFormData = { name: 'new_permission', description: 'New permission' };
        const createdPerm: Permission = { id: 3, ...permData };

        mockPost.mockResolvedValue({
          data: createdPerm,
          success: true,
        });

        const result = await permissionsApi.create(permData);

        expect(mockPost).toHaveBeenCalledWith('/permissions/', permData);
        expect(result.data.id).toBe(3);
      });
    });

    describe('update', () => {
      it('should update a permission', async () => {
        const updateData: Partial<PermissionFormData> = { description: 'Updated' };
        const updatedPerm: Permission = { id: 1, name: 'read_events', description: 'Updated' };

        mockPatch.mockResolvedValue({
          data: updatedPerm,
          success: true,
        });

        const result = await permissionsApi.update(1, updateData);

        expect(mockPatch).toHaveBeenCalledWith('/permissions/1', updateData);
      });
    });

    describe('replace', () => {
      it('should replace a permission', async () => {
        const permData: PermissionFormData = { name: 'read_events', description: 'Full update' };

        mockPut.mockResolvedValue({
          data: { id: 1, ...permData } as Permission,
          success: true,
        });

        const result = await permissionsApi.replace(1, permData);

        expect(mockPut).toHaveBeenCalledWith('/permissions/1', permData);
      });
    });

    describe('deleteByName', () => {
      it('should delete a permission by name', async () => {
        mockDelete.mockResolvedValue({
          data: true,
          success: true,
        });

        const result = await permissionsApi.deleteByName('read_events');

        expect(mockDelete).toHaveBeenCalledWith('/permissions/read_events');
      });
    });

    describe('delete', () => {
      it('should delete a permission by ID', async () => {
        mockDelete.mockResolvedValue({
          data: true,
          success: true,
        });

        const result = await permissionsApi.delete(1);

        expect(mockDelete).toHaveBeenCalledWith('/permissions/1');
      });
    });

    describe('getPermissionsForRole', () => {
      it('should fetch permissions for a role', async () => {
        const mockPermissions: Permission[] = [
          { id: 1, name: 'read_events' },
          { id: 2, name: 'write_events' },
        ];

        mockGet.mockResolvedValue({
          data: mockPermissions,
          success: true,
        });

        const result = await permissionsApi.getPermissionsForRole('admin');

        expect(mockGet).toHaveBeenCalledWith('/permissions/admin/permissions');
        expect(result.data).toHaveLength(2);
      });
    });

    describe('assignToRole', () => {
      it('should assign permission to role', async () => {
        mockPost.mockResolvedValue({
          data: { success: true, message: 'Permission assigned' },
          success: true,
        });

        const result = await permissionsApi.assignToRole('read_events', 'admin');

        expect(mockPost).toHaveBeenCalledWith('/permissions/roles/assign?permission_name=read_events&role_name=admin');
        expect(result.data.success).toBe(true);
      });
    });

    describe('removeFromRole', () => {
      it('should remove permission from role', async () => {
        mockPost.mockResolvedValue({
          data: { success: true, message: 'Permission removed' },
          success: true,
        });

        const result = await permissionsApi.removeFromRole('read_events', 'admin');

        expect(mockPost).toHaveBeenCalledWith('/permissions/roles/remove?permission_name=read_events&role_name=admin');
        expect(result.data.success).toBe(true);
      });
    });
  });

  // ============ Users API ============
  describe('usersApi', () => {
    describe('list', () => {
      it('should fetch paginated users', async () => {
        const mockUsers: User[] = [
          { id: 1, name: 'User 1', lastname: 'Last', email: 'user1@example.com', role: 'admin', role_id: 1, permissions: [] },
          { id: 2, name: 'User 2', lastname: 'Last', email: 'user2@example.com', role: 'user', role_id: 2, permissions: [] },
        ];

        mockGet.mockResolvedValue({
          data: { data: mockUsers, total: 2, skip: 0, limit: 10 },
          success: true,
        });

        const result = await usersApi.list();

        expect(mockGet).toHaveBeenCalledWith('/users/?skip=0&limit=10&order_by=id');
        expect(result.data.data).toHaveLength(2);
      });

      it('should fetch with custom pagination', async () => {
        mockGet.mockResolvedValue({
          data: { data: [], total: 0, skip: 5, limit: 20 },
          success: true,
        });

        await usersApi.list(5, 20);

        expect(mockGet).toHaveBeenCalledWith('/users/?skip=5&limit=20&order_by=id');
      });
    });

    describe('getById', () => {
      it('should fetch a user by ID', async () => {
        const mockUser: User = { id: 1, name: 'Test', lastname: 'User', email: 'test@example.com', role: 'admin', role_id: 1, permissions: [] };

        mockGet.mockResolvedValue({
          data: mockUser,
          success: true,
        });

        const result = await usersApi.getById(1);

        expect(mockGet).toHaveBeenCalledWith('/users/1');
        expect(result.data.email).toBe('test@example.com');
      });
    });

    describe('create', () => {
      it('should create a new user', async () => {
        const userData: UserFormData = {
          name: 'New',
          lastname: 'User',
          email: 'new@example.com',
          password: 'password123',
          role_id: 1,
        };
        const createdUser: User = { id: 3, ...userData, role: 'admin', role_id: 1, permissions: [] };

        mockPost.mockResolvedValue({
          data: createdUser,
          success: true,
        });

        const result = await usersApi.create(userData);

        expect(mockPost).toHaveBeenCalledWith('/users/', userData);
        expect(result.data.id).toBe(3);
      });
    });

    describe('update', () => {
      it('should update a user (partial)', async () => {
        const updateData: Partial<UserFormData> = { name: 'Updated' };
        const updatedUser: User = { id: 1, name: 'Updated', lastname: 'User', email: 'test@example.com', role: 'admin', role_id: 1, permissions: [] };

        mockPatch.mockResolvedValue({
          data: updatedUser,
          success: true,
        });

        const result = await usersApi.update(1, updateData);

        expect(mockPatch).toHaveBeenCalledWith('/users/1', updateData);
        expect(result.data.name).toBe('Updated');
      });
    });

    describe('replace', () => {
      it('should replace a user (full update)', async () => {
        const userData: UserFormData = {
          name: 'Full',
          lastname: 'Update',
          email: 'full@example.com',
          password: 'password',
          role_id: 2,
        };

        mockPut.mockResolvedValue({
          data: { id: 1, ...userData, role: 'user', role_id: 2, permissions: [] } as User,
          success: true,
        });

        const result = await usersApi.replace(1, userData);

        expect(mockPut).toHaveBeenCalledWith('/users/1', userData);
      });
    });

    describe('delete', () => {
      it('should delete a user by ID', async () => {
        mockDelete.mockResolvedValue({
          data: true,
          success: true,
        });

        const result = await usersApi.delete(1);

        expect(mockDelete).toHaveBeenCalledWith('/users/1');
        expect(result.data).toBe(true);
      });
    });
  });
});