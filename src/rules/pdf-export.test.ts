import { describe, it, expect } from 'vitest';
import { generateCharacterPDF } from './pdf-export';
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
const wizard = classes.find(c => c.name === 'Wizard')!;
const acolyte = backgrounds.find(b => b.name === 'Acolyte')!;

describe('pdf-export', () => {
  describe('generateCharacterPDF', () => {
    it('creates a PDF from an empty character', () => {
      const doc = generateCharacterPDF({});
      expect(doc).toBeDefined();
      const output = doc.output('arraybuffer');
      expect(output.byteLength).toBeGreaterThan(0);
    });

    it('creates a PDF from a minimal character', () => {
      const character: CharacterDraft = {
        name: 'Thorin',
        level: 1,
      };
      const doc = generateCharacterPDF(character);
      const output = doc.output('arraybuffer');
      expect(output.byteLength).toBeGreaterThan(0);
    });

    it('creates a PDF from a fully populated character', () => {
      const character: CharacterDraft = {
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
          { kind: 'armor', name: 'Chain Mail', category: 'heavy', baseAC: 16, addDex: false, stealthDisadvantage: true, weight: 55, cost: '75 gp' },
        ],
        cantripsKnown: [],
        spellsKnown: [],
        selectedLanguages: ['Common'],
      };
      const doc = generateCharacterPDF(character);
      const output = doc.output('arraybuffer');
      expect(output.byteLength).toBeGreaterThan(0);
    });

    it('adds a second page when content overflows', () => {
      const manyGear: Array<{ kind: 'gear'; name: string; weight: number; cost: string }> =
        Array.from({ length: 40 }, (_, i) => ({
          kind: 'gear' as const,
          name: `Adventuring Item ${i + 1}`,
          weight: 1,
          cost: '1 gp',
        }));

      const manyFeatures = Array.from({ length: 20 }, (_, i) => ({
        name: `Feature ${i + 1}`,
        description: `Description for feature ${i + 1}`,
      }));

      const overflowCharacter: CharacterDraft = {
        name: 'Overflow Test',
        species: {
          ...human,
          traits: Array.from({ length: 15 }, (_, i) => ({
            name: `Trait ${i + 1}`,
            description: `Description for trait ${i + 1}`,
          })),
        },
        class: {
          ...fighter,
          features: manyFeatures,
        },
        background: acolyte,
        level: 1,
        abilityScoreMethod: 'standard-array',
        baseAbilityScores: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
        skillProficiencies: ['Athletics', 'Insight'],
        equipment: manyGear,
        cantripsKnown: [],
        spellsKnown: [],
        selectedLanguages: ['Common'],
      };

      const doc = generateCharacterPDF(overflowCharacter);
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(2);
    });

    it('handles spellcasting characters', () => {
      const character: CharacterDraft = {
        name: 'Elara',
        species: human,
        class: wizard,
        background: acolyte,
        level: 1,
        abilityScoreMethod: 'standard-array',
        baseAbilityScores: { STR: 8, DEX: 14, CON: 13, INT: 15, WIS: 12, CHA: 10 },
        skillProficiencies: ['Arcana', 'Investigation'],
        cantripsKnown: ['Fire Bolt', 'Mage Hand', 'Prestidigitation'],
        spellsKnown: ['Magic Missile', 'Shield', 'Detect Magic'],
      };
      const doc = generateCharacterPDF(character);
      const output = doc.output('arraybuffer');
      expect(output.byteLength).toBeGreaterThan(0);
    });
  });
});
