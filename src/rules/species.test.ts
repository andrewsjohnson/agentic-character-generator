import { describe, it, expect } from 'vitest';
import {
  getSubspecies,
  getSpeciesBonuses,
  getSpeciesTraits,
  getSpeciesSpeed,
} from './species';
import type { Species, Subspecies } from '../types/species';

// Mock species data with ability bonuses for testing
// Note: Current races.json lacks ability bonuses, but we test the logic here
const mockDwarf: Species = {
  name: 'Dwarf',
  speed: 25,
  size: 'Medium',
  traits: [
    { name: 'Darkvision', description: 'See in dim light and darkness' },
    { name: 'Dwarven Resilience', description: 'Advantage on poison saves' },
    { name: 'Dwarven Combat Training', description: 'Proficiency with axes and hammers' },
    { name: 'Tool Proficiency', description: 'Gain artisan tool proficiency' },
    { name: 'Stonecunning', description: 'Expertise on stonework history checks' },
  ],
  languages: ['Common', 'Dwarvish'],
  subspecies: [
    {
      name: 'Hill Dwarf',
      traits: [
        { name: 'Dwarven Toughness', description: 'HP max increases by 1 per level' },
      ],
      abilityBonuses: { WIS: 1 },
    },
    {
      name: 'Mountain Dwarf',
      traits: [
        { name: 'Dwarven Armor Training', description: 'Proficiency with light and medium armor' },
      ],
      abilityBonuses: { STR: 2 },
    },
  ],
  abilityBonuses: { CON: 2 },
};

const mockElf: Species = {
  name: 'Elf',
  speed: 30,
  size: 'Medium',
  traits: [
    { name: 'Darkvision', description: 'See in dim light and darkness' },
    { name: 'Keen Senses', description: 'Proficiency in Perception' },
    { name: 'Fey Ancestry', description: 'Advantage on charm saves' },
    { name: 'Trance', description: 'Meditate for 4 hours instead of sleeping' },
  ],
  languages: ['Common', 'Elvish'],
  subspecies: [
    {
      name: 'High Elf',
      traits: [
        { name: 'Elf Weapon Training', description: 'Proficiency with swords and bows' },
        { name: 'High Elf Cantrip', description: 'Know one wizard cantrip' },
        { name: 'Extra Language', description: 'Speak one extra language' },
      ],
      abilityBonuses: { INT: 1 },
    },
    {
      name: 'Wood Elf',
      traits: [
        { name: 'Elf Weapon Training', description: 'Proficiency with swords and bows' },
        { name: 'Fleet of Foot', description: 'Base speed increases to 35 feet' },
        { name: 'Mask of the Wild', description: 'Can hide in natural phenomena' },
      ],
      abilityBonuses: { WIS: 1 },
      speed: 35,
    },
  ],
  abilityBonuses: { DEX: 2 },
};

const mockHuman: Species = {
  name: 'Human',
  speed: 30,
  size: 'Medium',
  traits: [],
  languages: ['Common'],
  subspecies: [],
  abilityBonuses: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
};

const mockHalfling: Species = {
  name: 'Halfling',
  speed: 25,
  size: 'Small',
  traits: [
    { name: 'Lucky', description: 'Reroll 1s on d20' },
    { name: 'Brave', description: 'Advantage on frightened saves' },
    { name: 'Halfling Nimbleness', description: 'Move through larger creatures' },
  ],
  languages: ['Common', 'Halfling'],
  subspecies: [
    {
      name: 'Lightfoot Halfling',
      traits: [
        { name: 'Naturally Stealthy', description: 'Can hide behind larger creatures' },
      ],
    },
  ],
};

const mockSpeciesData: Species[] = [mockDwarf, mockElf, mockHuman, mockHalfling];

describe('getSubspecies', () => {
  it('returns subspecies array for Dwarf', () => {
    const result = getSubspecies('Dwarf', mockSpeciesData);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Hill Dwarf');
    expect(result[1].name).toBe('Mountain Dwarf');
  });

  it('returns subspecies array for Elf', () => {
    const result = getSubspecies('Elf', mockSpeciesData);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('High Elf');
    expect(result[1].name).toBe('Wood Elf');
  });

  it('returns empty array for Human (no subspecies)', () => {
    const result = getSubspecies('Human', mockSpeciesData);
    expect(result).toEqual([]);
  });

  it('returns empty array for non-existent species', () => {
    const result = getSubspecies('Dragon', mockSpeciesData);
    expect(result).toEqual([]);
  });
});

describe('getSpeciesBonuses', () => {
  it('returns base bonuses for Dwarf only', () => {
    const result = getSpeciesBonuses(mockDwarf);
    expect(result).toEqual({ CON: 2 });
  });

  it('returns combined bonuses for Dwarf + Hill Dwarf', () => {
    const hillDwarf = mockDwarf.subspecies[0];
    const result = getSpeciesBonuses(mockDwarf, hillDwarf);
    expect(result).toEqual({ CON: 2, WIS: 1 });
  });

  it('returns combined bonuses for Dwarf + Mountain Dwarf', () => {
    const mountainDwarf = mockDwarf.subspecies[1];
    const result = getSpeciesBonuses(mockDwarf, mountainDwarf);
    expect(result).toEqual({ CON: 2, STR: 2 });
  });

  it('returns base bonuses for Elf only', () => {
    const result = getSpeciesBonuses(mockElf);
    expect(result).toEqual({ DEX: 2 });
  });

  it('returns combined bonuses for Elf + High Elf', () => {
    const highElf = mockElf.subspecies[0];
    const result = getSpeciesBonuses(mockElf, highElf);
    expect(result).toEqual({ DEX: 2, INT: 1 });
  });

  it('returns combined bonuses for Elf + Wood Elf', () => {
    const woodElf = mockElf.subspecies[1];
    const result = getSpeciesBonuses(mockElf, woodElf);
    expect(result).toEqual({ DEX: 2, WIS: 1 });
  });

  it('returns all abilities +1 for Human', () => {
    const result = getSpeciesBonuses(mockHuman);
    expect(result).toEqual({
      STR: 1,
      DEX: 1,
      CON: 1,
      INT: 1,
      WIS: 1,
      CHA: 1,
    });
  });

  it('returns empty object for species with no bonuses', () => {
    const result = getSpeciesBonuses(mockHalfling);
    expect(result).toEqual({});
  });

  it('returns empty object for subspecies with no bonuses', () => {
    const lightfoot = mockHalfling.subspecies[0];
    const result = getSpeciesBonuses(mockHalfling, lightfoot);
    expect(result).toEqual({});
  });

  it('adds bonuses when both species and subspecies define the same ability', () => {
    // Create a test case where both define STR
    const testSpecies: Species = {
      name: 'Test',
      speed: 30,
      size: 'Medium',
      traits: [],
      languages: ['Common'],
      subspecies: [],
      abilityBonuses: { STR: 2 },
    };
    const testSubspecies: Subspecies = {
      name: 'Test Sub',
      traits: [],
      abilityBonuses: { STR: 2 },
    };
    const result = getSpeciesBonuses(testSpecies, testSubspecies);
    expect(result).toEqual({ STR: 4 });
  });
});

describe('getSpeciesTraits', () => {
  it('returns base traits for Dwarf only', () => {
    const result = getSpeciesTraits(mockDwarf);
    expect(result).toHaveLength(5);
    expect(result[0].name).toBe('Darkvision');
    expect(result[4].name).toBe('Stonecunning');
  });

  it('returns combined traits for Dwarf + Hill Dwarf', () => {
    const hillDwarf = mockDwarf.subspecies[0];
    const result = getSpeciesTraits(mockDwarf, hillDwarf);
    expect(result).toHaveLength(6);
    expect(result[5].name).toBe('Dwarven Toughness');
  });

  it('returns combined traits for Elf + High Elf', () => {
    const highElf = mockElf.subspecies[0];
    const result = getSpeciesTraits(mockElf, highElf);
    expect(result).toHaveLength(7);
    expect(result[0].name).toBe('Darkvision');
    expect(result[6].name).toBe('Extra Language');
  });

  it('returns empty array for Human (no traits)', () => {
    const result = getSpeciesTraits(mockHuman);
    expect(result).toEqual([]);
  });

  it('does not mutate original species traits array', () => {
    const originalLength = mockDwarf.traits.length;
    const hillDwarf = mockDwarf.subspecies[0];
    getSpeciesTraits(mockDwarf, hillDwarf);
    expect(mockDwarf.traits).toHaveLength(originalLength);
  });
});

describe('getSpeciesSpeed', () => {
  it('returns base speed for Dwarf (25)', () => {
    const result = getSpeciesSpeed(mockDwarf);
    expect(result).toBe(25);
  });

  it('returns base speed for Dwarf + Hill Dwarf (no override)', () => {
    const hillDwarf = mockDwarf.subspecies[0];
    const result = getSpeciesSpeed(mockDwarf, hillDwarf);
    expect(result).toBe(25);
  });

  it('returns base speed for Elf (30)', () => {
    const result = getSpeciesSpeed(mockElf);
    expect(result).toBe(30);
  });

  it('returns base speed for Elf + High Elf (no override)', () => {
    const highElf = mockElf.subspecies[0];
    const result = getSpeciesSpeed(mockElf, highElf);
    expect(result).toBe(30);
  });

  it('returns subspecies speed for Elf + Wood Elf (override to 35)', () => {
    const woodElf = mockElf.subspecies[1];
    const result = getSpeciesSpeed(mockElf, woodElf);
    expect(result).toBe(35);
  });

  it('returns base speed for Halfling (25)', () => {
    const result = getSpeciesSpeed(mockHalfling);
    expect(result).toBe(25);
  });

  it('returns base speed for Human (30)', () => {
    const result = getSpeciesSpeed(mockHuman);
    expect(result).toBe(30);
  });
});
