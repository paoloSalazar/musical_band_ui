/**
 * Hook for downloading PDF files from the API
 */
import { useCallback } from 'react';
import { apiClient } from '../api/client';

export function useDownloadPdf() {
  const download = async (url: string, filename: string = 'download.pdf'): Promise<void> => {
    const response = await fetch(url, {
      headers: apiClient.getToken() ? { Authorization: `Bearer ${apiClient.getToken()}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }

    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
  };

  return { download };
}