import { describe, it, expect } from 'vitest';
import {
  serializeCharacter,
  deserializeCharacter,
  EXPORT_VERSION,
} from './serialization';
import type { CharacterDraft } from '../types/character';
import type { Species } from '../types/species';
import type { CharacterClass } from '../types/class';
import type { Background } from '../types/background';
import speciesData from '../data/races.json';
import classesData from '../data/classes.json';
import backgroundsData from '../data/backgrounds.json';

const species = speciesData as unknown as Species[];
const classes = classesData as unknown as CharacterClass[];
const backgrounds = backgroundsData as unknown as Background[];

const human = species.find(s => s.name === 'Human')!;
const fighter = classes.find(c => c.name === 'Fighter')!;
const acolyte = backgrounds.find(b => b.name === 'Acolyte')!;

describe('serialization', () => {
  describe('serializeCharacter', () => {
    it('wraps character data with version field', () => {
      const character: CharacterDraft = { name: 'Thorin' };
      const json = serializeCharacter(character);
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe(EXPORT_VERSION);
      expect(parsed.character.name).toBe('Thorin');
    });

    it('produces valid JSON', () => {
      const character: CharacterDraft = { name: 'Elara', level: 1 };
      const json = serializeCharacter(character);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('handles empty character', () => {
      const character: CharacterDraft = {};
      const json = serializeCharacter(character);
      const parsed = JSON.parse(json);
      expect(parsed.version).toBe(EXPORT_VERSION);
      expect(parsed.character).toEqual({});
    });
  });

  describe('deserializeCharacter', () => {
    it('round-trips a minimal character', () => {
      const original: CharacterDraft = { name: 'Thorin', level: 1 };
      const json = serializeCharacter(original);
      const result = deserializeCharacter(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.character.name).toBe('Thorin');
        expect(result.character.level).toBe(1);
      }
    });

    it('round-trips a fully populated character', () => {
      const original: CharacterDraft = {
        name: 'Aldric',
        species: human,
        class: fighter,
        background: acolyte,
        level: 1,
        abilityScoreMethod: 'standard-array',
        baseAbilityScores: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
        skillProficiencies: ['Athletics', 'Insight'],
        equipment: [
          { kind: 'weapon', name: 'Longsword', category: 'martial', damage: '1d8', damageType: 'slashing', properties: ['versatile'], weight: 3, cost: '15 gp' },
        ],
        cantripsKnown: [],
        spellsKnown: [],
        selectedLanguages: ['Common'],
        personalityTrait: 'I am always polite.',
        ideal: 'Greater Good',
        bond: 'I protect those who cannot protect themselves.',
        flaw: 'I am too trusting.',
      };
      const json = serializeCharacter(original);
      const result = deserializeCharacter(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.character.name).toBe('Aldric');
        expect(result.character.species?.name).toBe('Human');
        expect(result.character.class?.name).toBe('Fighter');
        expect(result.character.background?.name).toBe('Acolyte');
        expect(result.character.baseAbilityScores).toEqual({ STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 });
      }
    });

    it('rejects invalid JSON', () => {
      const result = deserializeCharacter('not valid json');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid JSON format.');
      }
    });

    it('rejects non-object JSON', () => {
      const result = deserializeCharacter('"just a string"');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Expected a JSON object.');
      }
    });

    it('rejects JSON array', () => {
      const result = deserializeCharacter('[]');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Expected a JSON object.');
      }
    });

    it('rejects missing version field', () => {
      const result = deserializeCharacter('{"character":{}}');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Missing or invalid version field.');
      }
    });

    it('rejects non-numeric version', () => {
      const result = deserializeCharacter('{"version":"1","character":{}}');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Missing or invalid version field.');
      }
    });

    it('rejects unsupported future version', () => {
      const result = deserializeCharacter(`{"version":${EXPORT_VERSION + 1},"character":{}}`);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Unsupported version');
      }
    });

    it('accepts current version', () => {
      const result = deserializeCharacter(`{"version":${EXPORT_VERSION},"character":{"name":"Test"}}`);
      expect(result.success).toBe(true);
    });

    it('rejects missing character field', () => {
      const result = deserializeCharacter(`{"version":${EXPORT_VERSION}}`);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Missing or invalid character field.');
      }
    });

    it('rejects character field that is an array', () => {
      const result = deserializeCharacter(`{"version":${EXPORT_VERSION},"character":[]}`);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Missing or invalid character field.');
      }
    });

    it('rejects invalid name type', () => {
      const result = deserializeCharacter(`{"version":${EXPORT_VERSION},"character":{"name":123}}`);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Character name must be a string.');
      }
    });

    it('rejects invalid level type', () => {
      const result = deserializeCharacter(`{"version":${EXPORT_VERSION},"character":{"level":"one"}}`);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Character level must be a number.');
      }
    });

    it('handles character with missing optional fields gracefully', () => {
      const result = deserializeCharacter(`{"version":${EXPORT_VERSION},"character":{"name":"Sparse"}}`);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.character.name).toBe('Sparse');
        expect(result.character.species).toBeUndefined();
        expect(result.character.class).toBeUndefined();
        expect(result.character.background).toBeUndefined();
      }
    });
  });
});
