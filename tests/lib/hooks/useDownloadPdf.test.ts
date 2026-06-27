/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDownloadPdf } from '@/app/lib/hooks/useDownloadPdf';

const mockToken = 'test-token-123';

vi.mock('@/app/lib/api/client', () => ({
  apiClient: {
    getToken: () => mockToken,
  },
  API_BASE_URL: 'http://localhost:8000/api',
}));

describe('useDownloadPdf', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    vi.clearAllMocks();
  });

  it('should return download function', () => {
    const { result } = renderHook(() => useDownloadPdf());
    expect(result.current.download).toBeDefined();
    expect(typeof result.current.download).toBe('function');
  });

  it('should download PDF and trigger file save', async () => {
    const mockBlob = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' });
    const mockUrl = 'blob:http://localhost/test';

    global.URL.createObjectURL = vi.fn(() => mockUrl);
    global.URL.revokeObjectURL = vi.fn();

    const mockResponse = {
      ok: true,
      blob: () => Promise.resolve(mockBlob),
      statusText: 'OK',
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useDownloadPdf());

    await act(async () => {
      await result.current.download('/api/test.pdf', 'test.pdf');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/test.pdf', {
      headers: { Authorization: `Bearer ${mockToken}` },
    });
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });

  it('should handle download errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDownloadPdf());

    await act(async () => {
      await expect(result.current.download('/api/test.pdf', 'test.pdf')).rejects.toThrow('Network error');
    });

    consoleErrorSpy.mockRestore();
  });

  it('should use default filename if not provided', async () => {
    const mockBlob = new Blob(['%PDF-1.4 test'], { type: 'application/pdf' });
    const mockUrl = 'blob:http://localhost/test';

    global.URL.createObjectURL = vi.fn(() => mockUrl);
    global.URL.revokeObjectURL = vi.fn();

    const mockResponse = {
      ok: true,
      blob: () => Promise.resolve(mockBlob),
      statusText: 'OK',
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useDownloadPdf());

    await act(async () => {
      await result.current.download('/api/test.pdf');
    });

    expect(global.fetch).toHaveBeenCalled();
  });
});