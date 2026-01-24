import { render, screen, waitFor } from '@testing-library/react';
import { BudgetAllocation } from '@/components/BudgetAllocation';

const mockFetch = global.fetch as jest.Mock;

describe('BudgetAllocation', () => {
  const mockOnSave = jest.fn();
  const mockProposals = [
    {
      id: 1,
      rootCauseId: 'supplier_quality',
      description: 'Test proposal 1',
      responsible: 'Test Person',
      cost: 100000
    },
    {
      id: 2,
      rootCauseId: 'training',
      description: 'Test proposal 2',
      responsible: 'Another Person',
      cost: 200000
    }
  ];

  beforeEach(() => {
    mockFetch.mockClear();
    mockOnSave.mockClear();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, allocations: [] })
    });
  });

  it('should render the component', async () => {
    render(
      <BudgetAllocation
        groupCode="TEST01"
        proposals={mockProposals}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Budgetallokering/i })).toBeInTheDocument();
    });
  });

  it('should display budget summary', async () => {
    render(
      <BudgetAllocation
        groupCode="TEST01"
        proposals={mockProposals}
        totalBudget={800000}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Total budget/i)).toBeInTheDocument();
      // The budget value may be formatted with space or comma as thousands separator
      expect(screen.getByText(/800[,\s]000/i)).toBeInTheDocument();
    });
  });

  it('should display all proposals', async () => {
    render(
      <BudgetAllocation
        groupCode="TEST01"
        proposals={mockProposals}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Test proposal 1')).toBeInTheDocument();
      expect(screen.getByText('Test proposal 2')).toBeInTheDocument();
    });
  });

  it('should show save button', async () => {
    render(
      <BudgetAllocation
        groupCode="TEST01"
        proposals={mockProposals}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Spara budgetallokering/i })).toBeInTheDocument();
    });
  });

  it('should show progress bar', async () => {
    render(
      <BudgetAllocation
        groupCode="TEST01"
        proposals={mockProposals}
        onSave={mockOnSave}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Budgetanvändning/i)).toBeInTheDocument();
    });
  });
});
