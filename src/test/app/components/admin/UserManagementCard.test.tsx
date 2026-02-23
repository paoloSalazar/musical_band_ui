import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserManagementCard, User } from '../../../../app/components/admin/UserManagementCard'
import { Permission } from '../../../../app/components/admin/PermissionCard'

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Administrator',
  permissionIds: ['perm-1', 'perm-2']
}

const mockPermissions: Permission[] = [
  { id: 'perm-1', name: 'Edit Users', description: 'Can edit users', category: 'User Management' },
  { id: 'perm-2', name: 'Delete Users', description: 'Can delete users', category: 'User Management' },
  { id: 'perm-3', name: 'View Reports', description: 'Can view reports', category: 'System Administration' }
]

describe('UserManagementCard', () => {
  it('renders user information correctly', () => {
    render(
      <UserManagementCard
        user={mockUser}
        permissions={mockPermissions}
        onAssignPermissions={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Administrator')).toBeInTheDocument()
  })

  it('displays the correct number of permissions', () => {
    render(
      <UserManagementCard
        user={mockUser}
        permissions={mockPermissions}
        onAssignPermissions={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('2 permissions')).toBeInTheDocument()
  })

  it('displays permission badges for user permissions', () => {
    render(
      <UserManagementCard
        user={mockUser}
        permissions={mockPermissions}
        onAssignPermissions={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('Edit Users')).toBeInTheDocument()
    expect(screen.getByText('Delete Users')).toBeInTheDocument()
  })

  it('calls onAssignPermissions when Manage Permissions button is clicked', async () => {
    const onAssignPermissions = vi.fn()
    const user = userEvent.setup()

    render(
      <UserManagementCard
        user={mockUser}
        permissions={mockPermissions}
        onAssignPermissions={onAssignPermissions}
        onDelete={vi.fn()}
      />
    )

    await user.click(screen.getByText('Manage Permissions'))
    expect(onAssignPermissions).toHaveBeenCalledWith(mockUser)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()

    render(
      <UserManagementCard
        user={mockUser}
        permissions={mockPermissions}
        onAssignPermissions={vi.fn()}
        onDelete={onDelete}
      />
    )

    const deleteButton = screen.getByRole('button', { name: '' })
    await user.click(deleteButton)
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('shows "+X more" badge when user has more than 3 permissions', () => {
    const userWithManyPermissions: User = {
      ...mockUser,
      permissionIds: ['perm-1', 'perm-2', 'perm-3', 'perm-4']
    }

    const morePermissions: Permission[] = [
      ...mockPermissions,
      { id: 'perm-4', name: 'Extra Permission', description: 'Extra', category: 'Other' }
    ]

    render(
      <UserManagementCard
        user={userWithManyPermissions}
        permissions={morePermissions}
        onAssignPermissions={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('+1 more')).toBeInTheDocument()
  })
})
