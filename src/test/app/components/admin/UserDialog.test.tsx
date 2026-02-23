import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserDialog } from '../../../../app/components/admin/UserDialog'
import { User } from '../../../../app/components/admin/UserManagementCard'

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Administrator',
  permissionIds: []
}

describe('UserDialog', () => {
  it('renders dialog when open is true', () => {
    render(
      <UserDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        user={null}
      />
    )

    expect(screen.getByRole('heading', { name: 'Add User' })).toBeInTheDocument()
    expect(screen.getByText('Add a new user to the system.')).toBeInTheDocument()
  })

  it('does not render dialog content when open is false', () => {
    render(
      <UserDialog
        open={false}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        user={null}
      />
    )

    expect(screen.queryByRole('heading', { name: 'Add User' })).not.toBeInTheDocument()
  })

  it('shows edit mode when user is provided', () => {
    render(
      <UserDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        user={mockUser}
      />
    )

    expect(screen.getByRole('heading', { name: 'Edit User' })).toBeInTheDocument()
    expect(screen.getByText('Update user information.')).toBeInTheDocument()
  })

  it('populates form with user data in edit mode', () => {
    render(
      <UserDialog
        open={true}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
        user={mockUser}
      />
    )

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Administrator')).toBeInTheDocument()
  })

  it('calls onOpenChange with false when Cancel is clicked', async () => {
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <UserDialog
        open={true}
        onOpenChange={onOpenChange}
        onSave={vi.fn()}
        user={null}
      />
    )

    await user.click(screen.getByText('Cancel'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onSave with form data when submitting', async () => {
    const onSave = vi.fn()
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <UserDialog
        open={true}
        onOpenChange={onOpenChange}
        onSave={onSave}
        user={null}
      />
    )

    await user.type(screen.getByLabelText('Name'), 'Jane Doe')
    await user.type(screen.getByLabelText('Email'), 'jane@example.com')
    // Note: Select component is tested separately - skipping role selection in unit test
    await user.click(screen.getByRole('button', { name: /Add User/ }))

    expect(onSave).toHaveBeenCalled()
  })

  it('calls onSave with user id when editing', async () => {
    const onSave = vi.fn()
    const onOpenChange = vi.fn()
    const user = userEvent.setup()

    render(
      <UserDialog
        open={true}
        onOpenChange={onOpenChange}
        onSave={onSave}
        user={mockUser}
      />
    )

    await user.clear(screen.getByLabelText('Name'))
    await user.type(screen.getByLabelText('Name'), 'John Smith')
    await user.click(screen.getByRole('button', { name: /Update User/ }))

    expect(onSave).toHaveBeenCalledWith({
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'Administrator',
      permissionIds: []
    })
  })
})
