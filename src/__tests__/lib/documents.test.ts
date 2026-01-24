import { documents, getDocumentsForRole, Document } from '@/lib/documents';

describe('documents', () => {
  const documentsList = Object.values(documents);

  describe('documents record', () => {
    it('should have documents defined', () => {
      expect(documents).toBeDefined();
      expect(documentsList.length).toBeGreaterThan(0);
    });

    it('each document should have required properties', () => {
      documentsList.forEach(doc => {
        expect(doc).toHaveProperty('id');
        expect(doc).toHaveProperty('name');
        expect(doc).toHaveProperty('description');
        expect(doc).toHaveProperty('content');
        expect(doc).toHaveProperty('availableFrom');
        expect(typeof doc.id).toBe('string');
        expect(typeof doc.name).toBe('string');
        expect(Array.isArray(doc.availableFrom)).toBe(true);
      });
    });

    it('all documents should have at least one role they are available from', () => {
      documentsList.forEach(doc => {
        expect(doc.availableFrom.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getDocumentsForRole', () => {
    it('should return documents available for a specific role', () => {
      // Find a role that has documents - use 'thomas' which we know exists
      const result = getDocumentsForRole('thomas');
      expect(result.length).toBeGreaterThan(0);
      result.forEach(doc => {
        expect(doc.availableFrom).toContain('thomas');
      });
    });

    it('should return empty array for role with no documents', () => {
      const result = getDocumentsForRole('non-existent-role');
      expect(result).toEqual([]);
    });
  });
});
