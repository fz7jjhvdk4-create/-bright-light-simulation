import { render, screen, waitFor } from '@testing-library/react';
import { FinalReport } from '@/components/FinalReport';

const mockFetch = global.fetch as jest.Mock;

describe('FinalReport', () => {
  const mockOnSubmit = jest.fn();
  const mockProposals = [
    {
      id: 1,
      rootCauseId: 'supplier_quality',
      description: 'Test proposal',
      responsible: 'Test Person',
      cost: 50000
    }
  ];

  beforeEach(() => {
    mockFetch.mockClear();
    mockOnSubmit.mockClear();
    mockFetch.mockResolvedValue({
      json: () => Promise.resolve({ success: true, report: null })
    });
  });

  it('should render the component', async () => {
    render(
      <FinalReport
        groupCode="TEST01"
        groupName="Test Group"
        proposals={mockProposals}
        onSubmit={mockOnSubmit}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Slutrapport/i })).toBeInTheDocument();
    });
  });

  it('should display all report sections', async () => {
    render(
      <FinalReport
        groupCode="TEST01"
        groupName="Test Group"
        proposals={mockProposals}
        onSubmit={mockOnSubmit}
      />
    );

    await waitFor(() => {
      // Use getAllByText for elements that appear multiple times (in sections and checklist)
      expect(screen.getAllByText(/Sammanfattning för ledningen/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Resultat vs mål/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Budgetsammanfattning/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Lärdomar/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Rekommendationer/i).length).toBeGreaterThan(0);
    });
  });

  it('should show budget information', async () => {
    render(
      <FinalReport
        groupCode="TEST01"
        groupName="Test Group"
        proposals={mockProposals}
        onSubmit={mockOnSubmit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/800 000 SEK/i)).toBeInTheDocument();
    });
  });

  it('should have download and submit buttons', async () => {
    render(
      <FinalReport
        groupCode="TEST01"
        groupName="Test Group"
        proposals={mockProposals}
        onSubmit={mockOnSubmit}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Ladda ner rapport/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Avsluta projekt/i })).toBeInTheDocument();
    });
  });

  it('should have a checklist', async () => {
    render(
      <FinalReport
        groupCode="TEST01"
        groupName="Test Group"
        proposals={mockProposals}
        onSubmit={mockOnSubmit}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Checklista/i)).toBeInTheDocument();
    });
  });
});
