import { describe, it, expect } from 'vitest';
import { trackEvent } from '@/lib/analytics-helper';

describe('Analytics', () => {
  it('trackEvent is a function', () => {
    expect(typeof trackEvent).toBe('function');
  });
});
