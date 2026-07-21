// Makes @testing-library/jest-dom's matcher types (toBeInTheDocument m.fl.)
// visible to tsc — jest.setup.js loads them at runtime but not for the type checker.
import '@testing-library/jest-dom';
