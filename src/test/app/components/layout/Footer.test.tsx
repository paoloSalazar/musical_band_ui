/// <reference types="vitest" />
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '../../../../app/components/layout/Footer'

describe('Footer', () => {
  it('renders the band name', () => {
    render(<Footer />)
    expect(screen.getByText('The Electric Dreams')).toBeInTheDocument()
  })

  it('renders the copyright with current year', () => {
    render(<Footer />)
    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`© ${currentYear} The Electric Dreams`))).toBeInTheDocument()
  })

  it('renders as a footer element', () => {
    const { container } = render(<Footer />)
    expect(container.querySelector('footer')).toBeInTheDocument()
  })
})
