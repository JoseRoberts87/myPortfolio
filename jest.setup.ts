// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// jsdom already provides working localStorage and sessionStorage (real
// `Storage` instances, so `Storage.prototype` spies keep working). We do NOT
// reassign `window.localStorage` — it's a read-only getter, so the old
// `global.localStorage = {...}` mock was silently ignored. Instead, guarantee
// test isolation by clearing both stores before every test, so no suite leaks
// cached state (e.g. the theme preference) into another.
beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});
