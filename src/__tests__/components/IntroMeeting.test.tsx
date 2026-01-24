import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntroMeeting } from '@/components/IntroMeeting';

const mockFetch = global.fetch as jest.Mock;

describe('IntroMeeting', () => {
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    mockFetch.mockClear();
    mockOnComplete.mockClear();
  });

  it('should render the component with Maria Ek header', () => {
    render(<IntroMeeting groupName="Test Group" onComplete={mockOnComplete} />);

    // Multiple elements contain Maria Ek, so use heading role
    expect(screen.getByRole('heading', { name: /Uppdragsmöte med Maria Ek/i })).toBeInTheDocument();
  });

  it('should display the initial welcome message', () => {
    render(<IntroMeeting groupName="Test Group" onComplete={mockOnComplete} />);

    expect(screen.getByText(/Välkomna till Bright Light Solutions/i)).toBeInTheDocument();
  });

  it('should have an input field for questions', () => {
    render(<IntroMeeting groupName="Test Group" onComplete={mockOnComplete} />);

    const input = screen.getByPlaceholderText(/Ställ en fråga till Maria/i);
    expect(input).toBeInTheDocument();
  });

  it('should have a continue button', () => {
    render(<IntroMeeting groupName="Test Group" onComplete={mockOnComplete} />);

    const continueButton = screen.getByRole('button', { name: /Gå vidare till projektplanering/i });
    expect(continueButton).toBeInTheDocument();
  });

  it('should call onComplete when continue button is clicked', () => {
    render(<IntroMeeting groupName="Test Group" onComplete={mockOnComplete} />);

    const continueButton = screen.getByRole('button', { name: /Gå vidare till projektplanering/i });
    fireEvent.click(continueButton);

    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should send message when form is submitted', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ response: 'Test response from Maria' })
    });

    render(<IntroMeeting groupName="Test Group" onComplete={mockOnComplete} />);

    const input = screen.getByPlaceholderText(/Ställ en fråga till Maria/i);
    // Find all buttons - the send button is the one that's not the continue button
    const buttons = screen.getAllByRole('button');
    const sendButton = buttons.find(btn => !btn.textContent?.includes('Gå vidare'));

    fireEvent.change(input, { target: { value: 'Test question' } });
    if (sendButton) {
      fireEvent.click(sendButton);
    }

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/intro-chat', expect.any(Object));
    });
  });

  it('should show question count', () => {
    render(<IntroMeeting groupName="Test Group" onComplete={mockOnComplete} />);

    expect(screen.getByText(/0 frågor ställda/i)).toBeInTheDocument();
  });
});
