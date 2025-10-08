import { describe, it, expect } from 'vitest';
// Placeholder: In real tests we'd mock db. Here we just assert the function exists.
import { RecommendationService } from '@/lib/services/recommendation-service';

describe('RecommendationService', () => {
  it('exposes recommendCourses function', () => {
    expect(typeof RecommendationService.recommendCourses).toBe('function');
  });
});
