import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PermissionCard, Permission } from '../../../../app/components/admin/PermissionCard'

const mockPermission: Permission = {
  id: 'perm-1',
  name: 'Edit Users',
  description: 'Allows editing user accounts',
  category: 'User Management'
}

describe('PermissionCard', () => {
  it('renders permission information correctly', () => {
    render(
      <PermissionCard
        permission={mockPermission}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('Edit Users')).toBeInTheDocument()
    expect(screen.getByText('Allows editing user accounts')).toBeInTheDocument()
    expect(screen.getByText('User Management')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()

    render(
      <PermissionCard
        permission={mockPermission}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    )

    const editButtons = screen.getAllByRole('button')
    const editButton = editButtons.find(btn => btn.querySelector('svg.lucide-pencil')) || editButtons[0]
    await user.click(editButton)
    expect(onEdit).toHaveBeenCalledWith(mockPermission)
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()

    render(
      <PermissionCard
        permission={mockPermission}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    )

    const buttons = screen.getAllByRole('button')
    // The delete button is the last button in the card
    const deleteButton = buttons[buttons.length - 1]
    await user.click(deleteButton)
    expect(onDelete).toHaveBeenCalledWith('perm-1')
  })

  it('renders with different categories', () => {
    const systemPermission: Permission = {
      ...mockPermission,
      category: 'System Administration'
    }

    render(
      <PermissionCard
        permission={systemPermission}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('System Administration')).toBeInTheDocument()
  })
})
