/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContractDownloadButton } from '@/app/components/events/ContractDownloadButton';

vi.mock('@/app/lib/api', () => ({
  eventsApi: {
    downloadContractPdf: vi.fn(),
  },
}));

vi.mock('lucide-react', () => ({
  FileSignature: () => <div data-testid="file-signature-icon" />,
}));

vi.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={`button-${props.variant || 'default'}-${props.size || 'default'}`}
      {...props}
    >
      {children}
    </button>
  ),
}));

import { eventsApi } from '@/app/lib/api';

const mockDownloadContractPdf = vi.mocked(eventsApi.downloadContractPdf);

describe('ContractDownloadButton', () => {
  const mockBlob = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' });
  const mockUrl = 'blob:http://localhost/test';

  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => mockUrl);
    URL.revokeObjectURL = vi.fn();
  });

  it('should render as a button', () => {
    mockDownloadContractPdf.mockResolvedValue(mockBlob);

    render(<ContractDownloadButton eventId={1} />);

    const button = screen.getByTestId(/button-outline-sm/);
    expect(button).toBeTruthy();
  });

  it('should call download function when clicked', async () => {
    mockDownloadContractPdf.mockResolvedValue(mockBlob);

    render(<ContractDownloadButton eventId={1} />);

    const button = screen.getByTestId(/button-outline-sm/);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockDownloadContractPdf).toHaveBeenCalledWith(1);
    });
  });

  it('should trigger file download when API returns PDF', async () => {
    mockDownloadContractPdf.mockResolvedValue(mockBlob);

    render(<ContractDownloadButton eventId={1} />);

    const button = screen.getByTestId(/button-outline-sm/);
    fireEvent.click(button);

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  it('should handle download errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockDownloadContractPdf.mockRejectedValue(new Error('Download failed'));

    render(<ContractDownloadButton eventId={1} />);

    const button = screen.getByTestId(/button-outline-sm/);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockDownloadContractPdf).toHaveBeenCalledWith(1);
    });

    consoleErrorSpy.mockRestore();
  });

  it('should have accessible aria-label', () => {
    mockDownloadContractPdf.mockResolvedValue(mockBlob);

    render(<ContractDownloadButton eventId={1} aria-label="Download contract PDF" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Download contract PDF');
  });
});