import { describe, it, expect } from 'vitest';
import {
  getBackgroundSkills,
  getBackgroundEquipment,
  getBackgroundLanguagesOrTools,
  hasSkillConflict,
} from './backgrounds';
import type { Background } from '../types/background';
import type { SkillName } from '../types/skill';

// Mock background data matching SRD specifications
const mockAcolyte: Background = {
  name: 'Acolyte',
  abilityOptions: ['INT', 'WIS', 'CHA'],
  skillProficiencies: ['Insight', 'Religion'],
  toolProficiency: "Calligrapher's Supplies",
  equipment: [
    { name: "Calligrapher's Supplies", quantity: 1 },
    { name: 'Book (Prayers)', quantity: 1 },
    { name: 'Holy Symbol', quantity: 1 },
    { name: 'Parchment', quantity: 10 },
    { name: 'Robe', quantity: 1 },
    { name: '8 GP', quantity: 1 },
  ],
  feature: {
    name: 'Shelter of the Faithful',
    description:
      'As an acolyte, you command the respect of those who share your faith.',
  },
  originFeat: 'Magic Initiate (Cleric)',
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

const mockCriminal: Background = {
  name: 'Criminal',
  abilityOptions: ['DEX', 'CON', 'INT'],
  skillProficiencies: ['Sleight of Hand', 'Stealth'],
  toolProficiency: "Thieves' Tools",
  equipment: [
    { name: 'Dagger', quantity: 2 },
    { name: "Thieves' Tools", quantity: 1 },
    { name: 'Crowbar', quantity: 1 },
    { name: 'Pouch', quantity: 2 },
    { name: "Clothes, Traveler's", quantity: 1 },
    { name: '16 GP', quantity: 1 },
  ],
  feature: {
    name: 'Criminal Contact',
    description: 'You have a reliable and trustworthy contact.',
  },
  originFeat: 'Alert',
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

const mockSage: Background = {
  name: 'Sage',
  abilityOptions: ['CON', 'INT', 'WIS'],
  skillProficiencies: ['Arcana', 'History'],
  toolProficiency: "Calligrapher's Supplies",
  equipment: [
    { name: 'Quarterstaff', quantity: 1 },
    { name: "Calligrapher's Supplies", quantity: 1 },
    { name: 'Book (History)', quantity: 1 },
    { name: 'Parchment', quantity: 8 },
    { name: 'Robe', quantity: 1 },
    { name: '8 GP', quantity: 1 },
  ],
  feature: {
    name: 'Researcher',
    description:
      'When you attempt to learn or recall a piece of lore, you often know where to find it.',
  },
  originFeat: 'Magic Initiate',
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

const mockSoldier: Background = {
  name: 'Soldier',
  abilityOptions: ['STR', 'DEX', 'CON'],
  skillProficiencies: ['Athletics', 'Intimidation'],
  toolProficiency: 'Gaming Set (choose one)',
  equipment: [
    { name: 'Spear', quantity: 1 },
    { name: 'Shortbow', quantity: 1 },
    { name: 'Arrows', quantity: 20 },
    { name: 'Gaming Set (choose one)', quantity: 1 },
    { name: "Healer's Kit", quantity: 1 },
    { name: 'Quiver', quantity: 1 },
    { name: "Clothes, Traveler's", quantity: 1 },
    { name: '14 GP', quantity: 1 },
  ],
  feature: {
    name: 'Military Rank',
    description: 'You have a military rank from your career as a soldier.',
  },
  originFeat: 'Savage Attacker',
  personalityTraits: [],
  ideals: [],
  bonds: [],
  flaws: [],
};

describe('getBackgroundSkills', () => {
  it('Acolyte grants Insight and Religion', () => {
    const skills = getBackgroundSkills(mockAcolyte);
    expect(skills).toEqual(['Insight', 'Religion']);
  });

  it('Criminal grants Sleight of Hand and Stealth', () => {
    const skills = getBackgroundSkills(mockCriminal);
    expect(skills).toEqual(['Sleight of Hand', 'Stealth']);
  });

  it('Sage grants Arcana and History', () => {
    const skills = getBackgroundSkills(mockSage);
    expect(skills).toEqual(['Arcana', 'History']);
  });

  it('Soldier grants Athletics and Intimidation', () => {
    const skills = getBackgroundSkills(mockSoldier);
    expect(skills).toEqual(['Athletics', 'Intimidation']);
  });

  it('All backgrounds grant exactly 2 skills', () => {
    const backgrounds = [mockAcolyte, mockCriminal, mockSage, mockSoldier];
    backgrounds.forEach((background) => {
      const skills = getBackgroundSkills(background);
      expect(skills).toHaveLength(2);
    });
  });
});

describe('getBackgroundEquipment', () => {
  it('returns equipment as string array', () => {
    const equipment = getBackgroundEquipment(mockAcolyte);
    expect(Array.isArray(equipment)).toBe(true);
    expect(equipment.every((item) => typeof item === 'string')).toBe(true);
  });

  it('formats single quantity items without count', () => {
    const equipment = getBackgroundEquipment(mockAcolyte);
    expect(equipment).toContain("Calligrapher's Supplies");
    expect(equipment).toContain('Book (Prayers)');
    expect(equipment).toContain('Robe');
  });

  it('formats multiple quantity items with count', () => {
    const equipment = getBackgroundEquipment(mockAcolyte);
    expect(equipment).toContain('Parchment (x10)');
  });

  it('Criminal equipment includes daggers with quantity', () => {
    const equipment = getBackgroundEquipment(mockCriminal);
    expect(equipment).toContain('Dagger (x2)');
    expect(equipment).toContain('Pouch (x2)');
  });

  it('Soldier equipment includes arrows with quantity', () => {
    const equipment = getBackgroundEquipment(mockSoldier);
    expect(equipment).toContain('Arrows (x20)');
  });

  it('Sage equipment list matches expected items', () => {
    const equipment = getBackgroundEquipment(mockSage);
    expect(equipment).toContain('Quarterstaff');
    expect(equipment).toContain('Parchment (x8)');
    expect(equipment).toContain('Book (History)');
  });
});

describe('getBackgroundLanguagesOrTools', () => {
  it('returns empty array for v1 implementation', () => {
    const result = getBackgroundLanguagesOrTools(mockAcolyte);
    expect(result).toEqual([]);
  });

  it('returns empty array for all backgrounds', () => {
    const backgrounds = [mockAcolyte, mockCriminal, mockSage, mockSoldier];
    backgrounds.forEach((background) => {
      const result = getBackgroundLanguagesOrTools(background);
      expect(result).toEqual([]);
    });
  });
});

describe('hasSkillConflict', () => {
  it('Rogue with Stealth picking Criminal shows Stealth conflict', () => {
    const rogueSkills: SkillName[] = ['Stealth', 'Investigation', 'Deception'];
    const criminalSkills = getBackgroundSkills(mockCriminal); // ['Sleight of Hand', 'Stealth']
    const conflicts = hasSkillConflict(criminalSkills, rogueSkills);
    expect(conflicts).toEqual(['Stealth']);
  });

  it('Wizard with Arcana picking Sage shows Arcana conflict', () => {
    const wizardSkills: SkillName[] = ['Arcana', 'Investigation'];
    const sageSkills = getBackgroundSkills(mockSage); // ['Arcana', 'History']
    const conflicts = hasSkillConflict(sageSkills, wizardSkills);
    expect(conflicts).toEqual(['Arcana']);
  });

  it('Fighter with Athletics picking Soldier shows Athletics conflict', () => {
    const fighterSkills: SkillName[] = ['Athletics', 'Intimidation'];
    const soldierSkills = getBackgroundSkills(mockSoldier); // ['Athletics', 'Intimidation']
    const conflicts = hasSkillConflict(soldierSkills, fighterSkills);
    expect(conflicts).toEqual(['Athletics', 'Intimidation']);
  });

  it('Non-overlapping skills return empty array', () => {
    const wizardSkills: SkillName[] = ['Arcana', 'Investigation'];
    const acolyteSkills = getBackgroundSkills(mockAcolyte); // ['Insight', 'Religion']
    const conflicts = hasSkillConflict(acolyteSkills, wizardSkills);
    expect(conflicts).toEqual([]);
  });

  it('Empty arrays return empty array', () => {
    const conflicts = hasSkillConflict([], []);
    expect(conflicts).toEqual([]);
  });

  it('Empty background skills return empty array', () => {
    const classSkills: SkillName[] = ['Stealth', 'Investigation'];
    const conflicts = hasSkillConflict([], classSkills);
    expect(conflicts).toEqual([]);
  });

  it('Empty class skills return empty array', () => {
    const backgroundSkills: SkillName[] = ['Stealth', 'Investigation'];
    const conflicts = hasSkillConflict(backgroundSkills, []);
    expect(conflicts).toEqual([]);
  });

  it('Multiple conflicts are detected', () => {
    const classSkills: SkillName[] = ['Stealth', 'Sleight of Hand', 'Investigation'];
    const criminalSkills = getBackgroundSkills(mockCriminal); // ['Sleight of Hand', 'Stealth']
    const conflicts = hasSkillConflict(criminalSkills, classSkills);
    expect(conflicts).toHaveLength(2);
    expect(conflicts).toContain('Sleight of Hand');
    expect(conflicts).toContain('Stealth');
  });
});
