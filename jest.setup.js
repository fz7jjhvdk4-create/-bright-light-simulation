import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  useParams: () => ({
    code: 'TEST01',
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock scrollIntoView which jsdom doesn't support
Element.prototype.scrollIntoView = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
});
