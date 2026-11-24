import { ReviewCacheMaintenance } from "./review-cache/maintenance";

/**
 * Advanced Review Caching Service
 * Provides multi-layer caching for optimal review system performance
 *
 * The implementation is layered (base -> reads -> lists -> maintenance) in
 * ./review-cache/*; every method keeps its original `this` semantics.
 */
export class ReviewCacheService extends ReviewCacheMaintenance {}
