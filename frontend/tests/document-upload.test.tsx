import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUploadDropzone } from '../features/tenders/components/FileUploadDropzone';

describe('FileUploadDropzone Component', () => {
  it('renders dropzone with upload instructions and constraints', () => {
    render(<FileUploadDropzone tenderId="tnd_test_123" onUploadSuccess={vi.fn()} />);

    expect(
      screen.getByText(/Drop tender PDFs here or click to browse/i)
    ).toBeDefined();
    expect(
      screen.getByText(/Multiple PDF files supported/i)
    ).toBeDefined();
  });

  it('validates and stages a clean PDF file', () => {
    render(<FileUploadDropzone tenderId="tnd_test_123" onUploadSuccess={vi.fn()} />);

    const file = new File(['%PDF-1.4 dummy content'], 'Technical_Bid.pdf', {
      type: 'application/pdf',
    });

    const dropzone = screen.getByText(/Drop tender PDFs here or click to browse/i).parentElement!;

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(screen.getByText('Technical_Bid.pdf')).toBeDefined();
    expect(screen.getByText(/Valid/i)).toBeDefined();
  });

  it('rejects unsupported non-PDF files with invalid badge', () => {
    render(<FileUploadDropzone tenderId="tnd_test_123" onUploadSuccess={vi.fn()} />);

    const docxFile = new File(['dummy content'], 'Proposal.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    const dropzone = screen.getByText(/Drop tender PDFs here or click to browse/i).parentElement!;

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [docxFile],
      },
    });

    expect(screen.getByText('Proposal.docx')).toBeDefined();
    expect(screen.getByText(/Invalid/i)).toBeDefined();
  });
});
