// Test setup file for Jest

// Mock chalk
jest.mock('chalk', () => ({
  default: {
    red: jest.fn((text: string) => text),
    green: jest.fn((text: string) => text),
    yellow: jest.fn((text: string) => text),
    blue: jest.fn((text: string) => text),
    magenta: jest.fn((text: string) => text),
    cyan: jest.fn((text: string) => text),
    white: jest.fn((text: string) => text),
    gray: jest.fn((text: string) => text),
    bgRed: jest.fn((text: string) => text),
    bgGreen: jest.fn((text: string) => text),
    bgYellow: jest.fn((text: string) => text),
    bgBlue: jest.fn((text: string) => text),
    bgMagenta: jest.fn((text: string) => text),
    bgCyan: jest.fn((text: string) => text),
    dim: jest.fn((text: string) => text),
    bold: jest.fn((text: string) => text),
    reset: jest.fn((text: string) => text),
    italic: jest.fn((text: string) => text),
    underline: jest.fn((text: string) => text),
  },
}));

// Setup global localStorage mock that works with Jest
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};

// Setup localStorage for jsdom environment
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test timeout
jest.setTimeout(30000);

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  localStorageMock.key.mockClear();
});