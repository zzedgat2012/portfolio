import { vi } from 'vitest';

// `server-only` throws outside a React Server Component build; unit tests run in plain Node.
vi.mock('server-only', () => ({}));
