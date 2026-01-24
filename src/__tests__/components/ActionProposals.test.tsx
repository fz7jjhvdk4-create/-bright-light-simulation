import { render, screen, waitFor } from '@testing-library/react';
import { ActionProposals } from '@/components/ActionProposals';

// Mock fetch
const mockFetch = global.fetch as jest.Mock;

describe('ActionProposals', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockFetch.mockClear();
    mockOnSubmit.mockClear();
  });

  it('should render the component', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, proposals: [] })
    });

    render(<ActionProposals groupCode="TEST01" onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Åtgärdsförslag/i })).toBeInTheDocument();
    });
  });

  it('should show empty state when no proposals', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, proposals: [] })
    });

    render(<ActionProposals groupCode="TEST01" onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByText(/Inga åtgärdsförslag tillagda/i)).toBeInTheDocument();
    });
  });

  it('should display proposals when loaded', async () => {
    const mockProposals = [
      {
        id: 1,
        rootCauseId: 'supplier',
        description: 'Test proposal description',
        responsible: 'Test Person',
        cost: 50000,
        createdAt: '2024-01-01'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, proposals: mockProposals })
    });

    render(<ActionProposals groupCode="TEST01" onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(screen.getByText('Test proposal description')).toBeInTheDocument();
    });
  });

  it('should fetch proposals on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, proposals: [] })
    });

    render(<ActionProposals groupCode="TEST01" onSubmit={mockOnSubmit} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/groups/TEST01/proposals');
    });
  });
});
