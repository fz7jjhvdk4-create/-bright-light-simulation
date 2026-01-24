import { render, screen, fireEvent } from '@testing-library/react';
import { ConflictResolution } from '@/components/ConflictResolution';

describe('ConflictResolution', () => {
  const mockOnResolved = jest.fn();

  beforeEach(() => {
    mockOnResolved.mockClear();
  });

  it('should render the component with heading', () => {
    render(<ConflictResolution groupCode="TEST01" onResolved={mockOnResolved} />);

    // Use getByRole for h2 heading - the exact heading is "Konflikthantering"
    expect(screen.getByRole('heading', { level: 2, name: /^Konflikthantering$/i })).toBeInTheDocument();
  });

  it('should display Thomas-Kilmann styles info', () => {
    render(<ConflictResolution groupCode="TEST01" onResolved={mockOnResolved} />);

    expect(screen.getByText(/Thomas-Kilmann/i)).toBeInTheDocument();
  });

  it('should display active conflicts section', () => {
    render(<ConflictResolution groupCode="TEST01" onResolved={mockOnResolved} />);

    expect(screen.getByText(/Aktiva konflikter/i)).toBeInTheDocument();
  });

  it('should display default conflicts', () => {
    render(<ConflictResolution groupCode="TEST01" onResolved={mockOnResolved} />);

    expect(screen.getByText(/Leverantörsbyte med Thomas/i)).toBeInTheDocument();
    expect(screen.getByText(/Resurskonflikt med produktion/i)).toBeInTheDocument();
    expect(screen.getByText(/Kvällsskiftets motstånd/i)).toBeInTheDocument();
  });

  it('should have handle buttons for each conflict', () => {
    render(<ConflictResolution groupCode="TEST01" onResolved={mockOnResolved} />);

    const handleButtons = screen.getAllByRole('button', { name: /Hantera/i });
    expect(handleButtons.length).toBe(3);
  });

  it('should open modal when clicking handle button', () => {
    render(<ConflictResolution groupCode="TEST01" onResolved={mockOnResolved} />);

    const handleButtons = screen.getAllByRole('button', { name: /Hantera/i });
    fireEvent.click(handleButtons[0]);

    // Modal should show conflict handling styles
    expect(screen.getByText(/Välj hanteringsstil/i)).toBeInTheDocument();
  });

  it('should show conflict styles in modal', () => {
    render(<ConflictResolution groupCode="TEST01" onResolved={mockOnResolved} />);

    const handleButtons = screen.getAllByRole('button', { name: /Hantera/i });
    fireEvent.click(handleButtons[0]);

    // Check for different conflict styles - in the modal as style buttons
    // Get all buttons and check their text content
    const allButtons = screen.getAllByRole('button');
    const styleNames = ['Tävlande', 'Samarbetande', 'Kompromissande', 'Undvikande', 'Tillmötesgående'];

    styleNames.forEach(style => {
      const found = allButtons.some(btn => btn.textContent?.includes(style));
      expect(found).toBe(true);
    });
  });

  it('should show conflict type labels', () => {
    render(<ConflictResolution groupCode="TEST01" onResolved={mockOnResolved} />);

    // Look for text that contains these labels
    const changeResistance = screen.getAllByText(/Förändringsmotstånd/i);
    expect(changeResistance.length).toBeGreaterThan(0);
  });
});
