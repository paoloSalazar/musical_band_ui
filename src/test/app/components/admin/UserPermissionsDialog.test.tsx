import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserPermissionsDialog } from '../../../../app/components/admin/UserPermissionsDialog'
import { User } from '../../../../app/components/admin/UserManagementCard'
import { Permission } from '../../../../app/components/admin/PermissionCard'

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Administrator',
  permissionIds: ['perm-1']
}

const mockPermissions: Permission[] = [
  { id: 'perm-1', name: 'Edit Users', description: 'Can edit users', category: 'User Management' },
  { id: 'perm-2', name: 'Delete Users', description: 'Can delete users', category: 'User Management' },
  { id: 'perm-3', name: 'View Reports', description: 'Can view reports', category: 'System Administration' }
]

describe('UserPermissionsDialog', () => {
  it('renders dialog when open is true', () => {
    render(
      <UserPermissionsDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        user={mockUser}
        permissions={mockPermissions}
      />
    )

    expect(screen.getByText('Assign Permissions')).toBeInTheDocument()
    expect(screen.getByText('Manage permissions for John Doe')).toBeInTheDocument()
  })

  it('does not render dialog content when open is false', () => {
    render(
      <UserPermissionsDialog
        open={false}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        user={mockUser}
        permissions={mockPermissions}
      />
    )

    expect(screen.queryByText('Assign Permissions')).not.toBeInTheDocument()
  })

  it('displays permissions grouped by category', () => {
    render(
      <UserPermissionsDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        user={mockUser}
        permissions={mockPermissions}
      />
    )

    expect(screen.getByText('User Management')).toBeInTheDocument()
    expect(screen.getByText('System Administration')).toBeInTheDocument()
  })

  it('shows correct permission count per category', () => {
    render(
      <UserPermissionsDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        user={mockUser}
        permissions={mockPermissions}
      />
    )

    // User Management has 2 permissions, 1 selected
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    // System Administration has 1 permission, 0 selected
    expect(screen.getByText('0 / 1')).toBeInTheDocument()
  })

  it('pre-selects user permissions', () => {
    render(
      <UserPermissionsDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        user={mockUser}
        permissions={mockPermissions}
      />
    )

    const editUsersCheckbox = screen.getByRole('checkbox', { name: /edit users/i })
    expect(editUsersCheckbox).toBeChecked()
  })

  it('allows toggling permissions', async () => {
    const user = userEvent.setup()

    render(
      <UserPermissionsDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        user={mockUser}
        permissions={mockPermissions}
      />
    )

    const deleteUsersCheckbox = screen.getByRole('checkbox', { name: /delete users/i })
    expect(deleteUsersCheckbox).not.toBeChecked()

    await user.click(deleteUsersCheckbox)
    expect(deleteUsersCheckbox).toBeChecked()
  })

  it('calls onOpenChange with false when Cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <UserPermissionsDialog
        open={true}
        onOpenChange={onOpenChange}
        onSave={vi.fn()}
        user={mockUser}
        permissions={mockPermissions}
      />
    )

    await user.click(screen.getByText('Cancel'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onSave with selected permission ids when submitting', async () => {
    const onSave = vi.fn()
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <UserPermissionsDialog
        open={true}
        onOpenChange={onOpenChange}
        onSave={onSave}
        user={mockUser}
        permissions={mockPermissions}
      />
    )

    // Toggle another permission
    await user.click(screen.getByRole('checkbox', { name: /delete users/i }))
    await user.click(screen.getByText('Save Permissions'))

    expect(onSave).toHaveBeenCalledWith('1', ['perm-1', 'perm-2'])
  })

  it('shows message when no permissions are available', () => {
    render(
      <UserPermissionsDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        user={mockUser}
        permissions={[]}
      />
    )

    expect(screen.getByText('No permissions available. Create permissions first.')).toBeInTheDocument()
  })

  it('handles null user gracefully', () => {
    render(
      <UserPermissionsDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        user={null}
        permissions={mockPermissions}
      />
    )

    expect(screen.getByText('Assign Permissions')).toBeInTheDocument()
  })
})
