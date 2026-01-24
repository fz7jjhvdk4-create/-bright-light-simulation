import { render, screen, waitFor } from '@testing-library/react';
import { ProjectDefinition } from '@/components/ProjectDefinition';

const mockFetch = global.fetch as jest.Mock;

describe('ProjectDefinition', () => {
  const mockOnSave = jest.fn();

  beforeEach(() => {
    mockFetch.mockClear();
    mockOnSave.mockClear();
  });

  it('should render the component heading', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, definition: null })
    });

    render(<ProjectDefinition groupCode="TEST01" onSave={mockOnSave} />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Projektdefinition/i })).toBeInTheDocument();
    });
  });

  it('should have textarea fields', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, definition: null })
    });

    render(<ProjectDefinition groupCode="TEST01" onSave={mockOnSave} />);

    await waitFor(() => {
      // Check for textareas by placeholder
      const textareas = screen.getAllByRole('textbox');
      expect(textareas.length).toBeGreaterThanOrEqual(5);
    });
  });

  it('should load existing definition', async () => {
    const mockDefinition = {
      purpose: 'Test purpose unique',
      goals: 'Test goals unique',
      scope: 'Test scope unique',
      exclusions: 'Test exclusions unique',
      success_criteria: 'Test criteria unique'
    };

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, definition: mockDefinition })
    });

    render(<ProjectDefinition groupCode="TEST01" onSave={mockOnSave} />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test purpose unique')).toBeInTheDocument();
    });
  });

  it('should fetch definition on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, definition: null })
    });

    render(<ProjectDefinition groupCode="TEST01" onSave={mockOnSave} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/groups/TEST01/project-definition');
    });
  });

  it('should have save button', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, definition: null })
    });

    render(<ProjectDefinition groupCode="TEST01" onSave={mockOnSave} />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Spara/i })).toBeInTheDocument();
    });
  });
});
