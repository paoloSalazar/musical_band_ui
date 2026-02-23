import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PermissionDialog } from '../../../../app/components/admin/PermissionDialog'
import { Permission } from '../../../../app/components/admin/PermissionCard'

const mockPermission: Permission = {
  id: 'perm-1',
  name: 'Edit Users',
  description: 'Allows editing user accounts',
  category: 'User Management'
}

describe('PermissionDialog', () => {
  it('renders dialog when open is true', () => {
    render(
      <PermissionDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        permission={null}
      />
    )

    expect(screen.getByRole('heading', { name: 'Add Permission' })).toBeInTheDocument()
    expect(screen.getByText('Create a new permission task.')).toBeInTheDocument()
  })

  it('does not render dialog content when open is false', () => {
    render(
      <PermissionDialog
        open={false}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        permission={null}
      />
    )

    expect(screen.queryByRole('heading', { name: 'Add Permission' })).not.toBeInTheDocument()
  })

  it('shows edit mode when permission is provided', () => {
    render(
      <PermissionDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        permission={mockPermission}
      />
    )

    expect(screen.getByRole('heading', { name: 'Edit Permission' })).toBeInTheDocument()
    expect(screen.getByText('Update permission details.')).toBeInTheDocument()
  })

  it('populates form with permission data in edit mode', () => {
    render(
      <PermissionDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        permission={mockPermission}
      />
    )

    expect(screen.getByDisplayValue('Edit Users')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Allows editing user accounts')).toBeInTheDocument()
    expect(screen.getByDisplayValue('User Management')).toBeInTheDocument()
  })

  it('calls onOpenChange with false when Cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <PermissionDialog
        open={true}
        onOpenChange={onOpenChange}
        onSave={vi.fn()}
        permission={null}
      />
    )

    await user.click(screen.getByText('Cancel'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onSave with form data when submitting new permission', async () => {
    const onSave = vi.fn()
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <PermissionDialog
        open={true}
        onOpenChange={onOpenChange}
        onSave={onSave}
        permission={null}
      />
    )

    await user.type(screen.getByLabelText('Permission Name'), 'Delete Users')
    await user.type(screen.getByLabelText('Description'), 'Allows deleting users')
    // Note: Select component is tested separately - skipping category selection in unit test
    await user.click(screen.getByRole('button', { name: /Add Permission/ }))

    expect(onSave).toHaveBeenCalled()
  })

  it('calls onSave with permission id when editing', async () => {
    const onSave = vi.fn()
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <PermissionDialog
        open={true}
        onOpenChange={onOpenChange}
        onSave={onSave}
        permission={mockPermission}
      />
    )

    await user.clear(screen.getByLabelText('Permission Name'))
    await user.type(screen.getByLabelText('Permission Name'), 'Edit All Users')
    await user.click(screen.getByRole('button', { name: /Update Permission/ }))

    expect(onSave).toHaveBeenCalledWith({
      id: 'perm-1',
      name: 'Edit All Users',
      description: 'Allows editing user accounts',
      category: 'User Management'
    })
  })
})
