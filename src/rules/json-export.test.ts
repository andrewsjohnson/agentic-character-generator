import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sanitizeFilename, generateFilename, exportCharacterJSON } from './json-export';
import type { CharacterDraft } from '../types/character';

describe('json-export', () => {
  describe('sanitizeFilename', () => {
    it('returns alphanumeric names unchanged', () => {
      expect(sanitizeFilename('Thorin')).toBe('Thorin');
    });

    it('replaces spaces with hyphens', () => {
      expect(sanitizeFilename('Thorin Oakenshield')).toBe('Thorin-Oakenshield');
    });

    it('replaces special characters with hyphens', () => {
      expect(sanitizeFilename("Thorn'ak the Brave!")).toBe('Thorn-ak-the-Brave');
    });

    it('collapses consecutive hyphens', () => {
      expect(sanitizeFilename('a---b')).toBe('a-b');
    });

    it('trims leading and trailing hyphens', () => {
      expect(sanitizeFilename('--name--')).toBe('name');
    });
  });

  describe('generateFilename', () => {
    beforeEach(() => {
      vi.spyOn(Date, 'now').mockReturnValue(1708300000000);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('includes character name and timestamp', () => {
      const character: CharacterDraft = { name: 'Thorin' };
      expect(generateFilename(character)).toBe('character-Thorin-1708300000000.json');
    });

    it('uses "unnamed" for characters without a name', () => {
      const character: CharacterDraft = {};
      expect(generateFilename(character)).toBe('character-unnamed-1708300000000.json');
    });

    it('sanitizes special characters in the name', () => {
      const character: CharacterDraft = { name: 'Sir Galahad III' };
      expect(generateFilename(character)).toBe('character-Sir-Galahad-III-1708300000000.json');
    });
  });

  describe('exportCharacterJSON', () => {
    let mockAnchor: { href: string; download: string; click: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      vi.spyOn(Date, 'now').mockReturnValue(1708300000000);
      mockAnchor = { href: '', download: '', click: vi.fn() };
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);
      // jsdom doesn't provide URL.createObjectURL/revokeObjectURL, so define them
      URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
      URL.revokeObjectURL = vi.fn();
      vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('triggers a download with correct filename', () => {
      const character: CharacterDraft = { name: 'Thorin' };
      exportCharacterJSON(character);

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.download).toBe('character-Thorin-1708300000000.json');
      expect(mockAnchor.click).toHaveBeenCalled();
    });

    it('creates a blob with correct content type', () => {
      const character: CharacterDraft = { name: 'Test' };
      exportCharacterJSON(character);

      expect(URL.createObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'application/json' })
      );
    });

    it('cleans up after download', () => {
      const character: CharacterDraft = {};
      exportCharacterJSON(character);

      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });
  });
});
