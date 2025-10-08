import { describe, it, expect } from 'vitest';
import { trackEvent } from '@/lib/analytics';

describe('Analytics', () => {
  it('trackEvent is a function', () => {
    expect(typeof trackEvent).toBe('function');
  });
});
