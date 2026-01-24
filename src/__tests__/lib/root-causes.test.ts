import { rootCauses, getRootCauseById, RootCause } from '@/lib/root-causes';

describe('root-causes', () => {
  describe('rootCauses array', () => {
    it('should have root causes defined', () => {
      expect(rootCauses).toBeDefined();
      expect(rootCauses.length).toBeGreaterThan(0);
    });

    it('each root cause should have required properties', () => {
      rootCauses.forEach(rc => {
        expect(rc).toHaveProperty('id');
        expect(rc).toHaveProperty('name');
        expect(rc).toHaveProperty('impact');
        expect(rc).toHaveProperty('description');
        expect(typeof rc.id).toBe('string');
        expect(typeof rc.name).toBe('string');
        expect(typeof rc.impact).toBe('number');
        expect(typeof rc.description).toBe('string');
      });
    });

    it('impact values should be between 0 and 1', () => {
      rootCauses.forEach(rc => {
        expect(rc.impact).toBeGreaterThanOrEqual(0);
        expect(rc.impact).toBeLessThanOrEqual(1);
      });
    });

    it('total impact should add up to approximately 1', () => {
      const totalImpact = rootCauses.reduce((sum, rc) => sum + rc.impact, 0);
      expect(totalImpact).toBeCloseTo(1, 1); // Allow some margin
    });

    it('should have unique ids', () => {
      const ids = rootCauses.map(rc => rc.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('getRootCauseById', () => {
    it('should return the correct root cause', () => {
      const firstCause = rootCauses[0];
      const result = getRootCauseById(firstCause.id);
      expect(result).toEqual(firstCause);
    });

    it('should return undefined for non-existent id', () => {
      const result = getRootCauseById('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should find supplier root cause', () => {
      const result = getRootCauseById('supplier');
      expect(result).toBeDefined();
      expect(result?.name).toContain('AsiaCore');
    });
  });
});
