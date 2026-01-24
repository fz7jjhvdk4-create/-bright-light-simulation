import { render, screen, waitFor } from '@testing-library/react';
import { InvestigationReport } from '@/components/InvestigationReport';

const mockFetch = global.fetch as jest.Mock;

describe('InvestigationReport', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockFetch.mockClear();
    mockOnSubmit.mockClear();
  });

  it('should render the component', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, report: null })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, proposals: [] })
      });

    render(
      <InvestigationReport
        groupCode="TEST01"
        onSubmit={mockOnSubmit}
        isSubmitted={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Utredningsrapport/i)).toBeInTheDocument();
    });
  });

  it('should show submitted state when isSubmitted is true', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, report: null })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, proposals: [] })
      });

    render(
      <InvestigationReport
        groupCode="TEST01"
        onSubmit={mockOnSubmit}
        isSubmitted={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Rapport inskickad/i)).toBeInTheDocument();
    });
  });

  it('should display form fields when not submitted', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, report: null })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, proposals: [] })
      });

    render(
      <InvestigationReport
        groupCode="TEST01"
        onSubmit={mockOnSubmit}
        isSubmitted={false}
      />
    );

    await waitFor(() => {
      // Use getAllByText since "Sammanfattning" appears multiple times
      expect(screen.getAllByText(/Sammanfattning/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Metodik/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Identifierade rotorsaker/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Slutsatser/i).length).toBeGreaterThan(0);
    });
  });

  it('should have checklist for submission', async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, report: null })
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, proposals: [] })
      });

    render(
      <InvestigationReport
        groupCode="TEST01"
        onSubmit={mockOnSubmit}
        isSubmitted={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Checklista för inlämning/i)).toBeInTheDocument();
    });
  });
});
