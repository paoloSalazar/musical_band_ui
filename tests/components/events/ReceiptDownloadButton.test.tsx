/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReceiptDownloadButton } from '@/app/components/events/ReceiptDownloadButton';

vi.mock('@/app/lib/api', () => ({
  eventsApi: {
    downloadReceiptPdf: vi.fn(),
  },
}));

vi.mock('lucide-react', () => ({
  FileText: () => <div data-testid="file-text-icon" />,
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

const mockDownloadReceiptPdf = vi.mocked(eventsApi.downloadReceiptPdf);

describe('ReceiptDownloadButton', () => {
  const mockBlob = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' });
  const mockUrl = 'blob:http://localhost/test.pdf';

  beforeEach(() => {
    vi.clearAllMocks();
    URL.createObjectURL = vi.fn(() => mockUrl);
    URL.revokeObjectURL = vi.fn();
  });

  it('should render as a button', () => {
    mockDownloadReceiptPdf.mockResolvedValue(mockBlob);

    render(<ReceiptDownloadButton eventId={1} />);

    const button = screen.getByTestId(/button-outline-sm/);
    expect(button).toBeTruthy();
  });

  it('should call download function when clicked', async () => {
    mockDownloadReceiptPdf.mockResolvedValue(mockBlob);

    render(<ReceiptDownloadButton eventId={1} />);

    const button = screen.getByTestId(/button-outline-sm/);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockDownloadReceiptPdf).toHaveBeenCalledWith(1);
    });
  });

  it('should trigger file download when API returns PDF', async () => {
    mockDownloadReceiptPdf.mockResolvedValue(mockBlob);

    render(<ReceiptDownloadButton eventId={1} />);

    const button = screen.getByTestId(/button-outline-sm/);
    fireEvent.click(button);

    await waitFor(() => {
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  it('should show loading state while downloading', async () => {
    mockDownloadReceiptPdf.mockImplementation(() => new Promise(() => {}));

    render(<ReceiptDownloadButton eventId={1} />);

    const button = screen.getByTestId(/button-outline-sm/);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockDownloadReceiptPdf).toHaveBeenCalledWith(1);
    });
  });

  it('should handle download errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockDownloadReceiptPdf.mockRejectedValue(new Error('Download failed'));

    render(<ReceiptDownloadButton eventId={1} />);

    const button = screen.getByTestId(/button-outline-sm/);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockDownloadReceiptPdf).toHaveBeenCalledWith(1);
    });

    consoleErrorSpy.mockRestore();
  });

  it('should have accessible aria-label', () => {
    mockDownloadReceiptPdf.mockResolvedValue(mockBlob);

    render(<ReceiptDownloadButton eventId={1} aria-label="Download receipt PDF" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Download receipt PDF');
  });
});