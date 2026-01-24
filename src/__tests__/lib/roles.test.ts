import { roles, roleCategories, getRoleById, getRolesForPhase, Role } from '@/lib/roles';

describe('roles', () => {
  describe('roles array', () => {
    it('should have roles defined', () => {
      expect(roles).toBeDefined();
      expect(roles.length).toBeGreaterThan(0);
    });

    it('each role should have required properties', () => {
      roles.forEach(role => {
        expect(role).toHaveProperty('id');
        expect(role).toHaveProperty('name');
        expect(role).toHaveProperty('title');
        expect(role).toHaveProperty('knowledge');
        expect(typeof role.id).toBe('string');
        expect(typeof role.name).toBe('string');
        expect(typeof role.title).toBe('string');
      });
    });

    it('each role should have knowledge structure', () => {
      roles.forEach(role => {
        expect(role.knowledge).toHaveProperty('surface');
        expect(role.knowledge).toHaveProperty('deeper');
        expect(role.knowledge).toHaveProperty('hidden');
      });
    });

    it('should have unique ids', () => {
      const ids = roles.map(r => r.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });
  });

  describe('roleCategories', () => {
    it('should have categories defined', () => {
      expect(roleCategories).toBeDefined();
      expect(roleCategories.length).toBeGreaterThan(0);
    });

    it('each category should have id, name, and roles', () => {
      roleCategories.forEach(category => {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('roles');
        expect(typeof category.id).toBe('string');
        expect(typeof category.name).toBe('string');
        expect(Array.isArray(category.roles)).toBe(true);
      });
    });
  });

  describe('getRoleById', () => {
    it('should return the correct role', () => {
      const firstRole = roles[0];
      const result = getRoleById(firstRole.id);
      expect(result).toEqual(firstRole);
    });

    it('should return undefined for non-existent id', () => {
      const result = getRoleById('non-existent-role');
      expect(result).toBeUndefined();
    });

    it('should find maria role', () => {
      const result = getRoleById('maria');
      expect(result).toBeDefined();
      expect(result?.name).toBe('Maria Ek');
      expect(result?.title).toBe('VD');
    });
  });

  describe('getRolesForPhase', () => {
    it('should return roles for phase 1', () => {
      const phase1Roles = getRolesForPhase(1);
      expect(phase1Roles.length).toBeGreaterThan(0);
    });

    it('should return roles for phase 2', () => {
      const phase2Roles = getRolesForPhase(2);
      expect(phase2Roles.length).toBeGreaterThan(0);
    });

    it('phase 2 roles should include phase 1 roles or have additional ones', () => {
      const phase1Roles = getRolesForPhase(1);
      const phase2Roles = getRolesForPhase(2);
      expect(phase2Roles.length).toBeGreaterThanOrEqual(phase1Roles.length);
    });
  });
});
