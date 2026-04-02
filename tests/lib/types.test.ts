import { describe, it, expect } from 'vitest';
import type {
  User,
  LoginCredentials,
  LoginResponse,
  UserState,
  UserActions,
  UserContextType,
  Role,
  Permission,
  RoleFormData,
  PermissionFormData,
  UserFormData,
  AssignPermissionResponse,
  UserDetail,
  UserProfileWithDetails,
  EventCreator,
  Event,
  EventFormData,
  PaymentType,
  Payment,
  PaymentSummary,
  PaymentFormData,
} from '@/app/lib/types';

describe('types.ts', () => {
  describe('User type', () => {
    it('should have required properties', () => {
      const user: User = {
        id: 1,
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        role: 'admin',
        role_id: 1,
        permissions: ['read:users'],
      };
      expect(user.id).toBe(1);
      expect(user.name).toBe('John');
      expect(user.role).toBe('admin');
    });

    it('should allow optional properties', () => {
      const user: User = {
        id: 1,
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        role: 'admin',
        role_id: 1,
        permissions: [],
        second_lastname: 'Smith',
        phone_number: '1234567890',
      };
      expect(user.second_lastname).toBe('Smith');
      expect(user.phone_number).toBe('1234567890');
    });
  });

  describe('LoginCredentials type', () => {
    it('should require email and password', () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(credentials.email).toBe('test@example.com');
      expect(credentials.password).toBe('password123');
    });
  });

  describe('LoginResponse type', () => {
    it('should have access_token, token_type, and user', () => {
      const response: LoginResponse = {
        access_token: 'mock-token',
        token_type: 'Bearer',
        user: {
          id: 1,
          name: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
          role: 'admin',
          role_id: 1,
          permissions: [],
        },
      };
      expect(response.access_token).toBe('mock-token');
      expect(response.token_type).toBe('Bearer');
      expect(response.user.name).toBe('John');
    });
  });

  describe('UserContextType', () => {
    it('should combine UserState and UserActions', () => {
      const context: UserContextType = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: async () => {},
        logout: async () => {},
        hasPermission: () => false,
        hasRole: () => false,
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
      };
      expect(context.isAuthenticated).toBe(false);
      expect(typeof context.login).toBe('function');
    });
  });

  describe('Role type', () => {
    it('should have id, name, and optional description', () => {
      const role: Role = {
        id: 1,
        name: 'Admin',
        description: 'Administrator role',
      };
      expect(role.id).toBe(1);
      expect(role.name).toBe('Admin');
    });
  });

  describe('Permission type', () => {
    it('should have id, name, and optional description', () => {
      const permission: Permission = {
        id: 1,
        name: 'read:users',
      };
      expect(permission.id).toBe(1);
      expect(permission.name).toBe('read:users');
    });
  });

  describe('Event type', () => {
    it('should have all required event properties', () => {
      const event: Event = {
        id: 1,
        name: 'Concert',
        place: 'Stadium',
        start_datetime: '2024-01-01T20:00:00Z',
        end_datetime: '2024-01-01T23:00:00Z',
        is_all_day: false,
        user_id: 1,
        status: 'active',
        created_by: {
          user_id: 1,
          name: 'John',
          lastname: 'Doe',
          email: 'john@example.com',
        },
      };
      expect(event.name).toBe('Concert');
      expect(event.is_all_day).toBe(false);
    });
  });

  describe('PaymentType', () => {
    it('should allow ADVANCE, REMAINING, or TOTAL', () => {
      const advance: PaymentType = 'ADVANCE';
      const remaining: PaymentType = 'REMAINING';
      const total: PaymentType = 'TOTAL';

      expect(advance).toBe('ADVANCE');
      expect(remaining).toBe('REMAINING');
      expect(total).toBe('TOTAL');
    });
  });

  describe('Payment type', () => {
    it('should have all required payment properties', () => {
      const payment: Payment = {
        id: 1,
        event_id: 1,
        user_id: 1,
        amount: '100.00',
        payment_type: 'ADVANCE',
        payment_date: '2024-01-01',
      };
      expect(payment.amount).toBe('100.00');
      expect(payment.payment_type).toBe('ADVANCE');
    });
  });

  describe('PaymentSummary type', () => {
    it('should have total_paid, remaining_balance, and final_price', () => {
      const summary: PaymentSummary = {
        total_paid: '500.00',
        remaining_balance: '500.00',
        final_price: '1000.00',
      };
      expect(summary.total_paid).toBe('500.00');
      expect(summary.remaining_balance).toBe('500.00');
      expect(summary.final_price).toBe('1000.00');
    });
  });

  describe('RoleFormData type', () => {
    it('should require name and allow optional description', () => {
      const formData: RoleFormData = {
        name: 'Admin',
      };
      expect(formData.name).toBe('Admin');
    });
  });

  describe('UserFormData type', () => {
    it('should require all user creation fields', () => {
      const formData: UserFormData = {
        name: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role_id: 1,
      };
      expect(formData.name).toBe('John');
      expect(formData.role_id).toBe(1);
    });
  });
});