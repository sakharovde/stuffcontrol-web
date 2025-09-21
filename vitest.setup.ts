import 'vitest';
import '@testing-library/jest-dom/vitest';

import 'fake-indexeddb/auto';

import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
