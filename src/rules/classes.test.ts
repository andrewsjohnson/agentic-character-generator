import { describe, it, expect } from 'vitest';
import {
  getHitDie,
  getClassProficiencies,
  getStartingEquipmentOptions,
  getClassSkillChoices,
} from './classes';
import type { CharacterClass } from '../types/class';

// Mock class data matching SRD specifications
const mockFighter: CharacterClass = {
  name: 'Fighter',
  hitDie: 10,
  primaryAbility: ['Strength', 'Dexterity'],
  savingThrows: ['Strength', 'Constitution'],
  armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
  weaponProficiencies: ['simple', 'martial'],
  skillChoices: {
    options: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
    count: 2,
  },
  features: [
    {
      name: 'Fighting Style',
      description: 'You adopt a particular style of fighting as your specialty.',
    },
    {
      name: 'Second Wind',
      description: 'You have a limited well of stamina that you can draw on to protect yourself from harm.',
    },
  ],
  subclasses: [],
};

const mockWizard: CharacterClass = {
  name: 'Wizard',
  hitDie: 6,
  primaryAbility: ['Intelligence'],
  savingThrows: ['Intelligence', 'Wisdom'],
  armorProficiencies: [],
  weaponProficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
  skillChoices: {
    options: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
    count: 2,
  },
  features: [
    {
      name: 'Spellcasting',
      description: 'As a student of arcane magic, you have a spellbook containing spells.',
    },
    {
      name: 'Arcane Recovery',
      description: 'You have learned to regain some of your magical energy by studying your spellbook.',
    },
  ],
  spellcasting: {
    ability: 'Intelligence',
    cantripsKnown: 3,
    spellSlots: 2,
    spellsPrepared: 6,
  },
  subclasses: [],
};

const mockRogue: CharacterClass = {
  name: 'Rogue',
  hitDie: 8,
  primaryAbility: ['Dexterity'],
  savingThrows: ['Dexterity', 'Intelligence'],
  armorProficiencies: ['light'],
  weaponProficiencies: ['simple', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'],
  skillChoices: {
    options: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
    count: 4,
  },
  features: [
    {
      name: 'Expertise',
      description: 'Choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.',
    },
    {
      name: 'Sneak Attack',
      description: 'You know how to strike subtly and exploit a foe\'s distraction.',
    },
    {
      name: 'Thieves\' Cant',
      description: 'During your rogue training you learned thieves\' cant.',
    },
  ],
  subclasses: [],
};

const mockCleric: CharacterClass = {
  name: 'Cleric',
  hitDie: 8,
  primaryAbility: ['Wisdom'],
  savingThrows: ['Wisdom', 'Charisma'],
  armorProficiencies: ['light', 'medium', 'shields'],
  weaponProficiencies: ['simple'],
  skillChoices: {
    options: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
    count: 2,
  },
  features: [
    {
      name: 'Spellcasting',
      description: 'As a conduit for divine power, you can cast cleric spells.',
    },
    {
      name: 'Divine Domain',
      description: 'Choose one domain related to your deity.',
    },
  ],
  spellcasting: {
    ability: 'Wisdom',
    cantripsKnown: 3,
    spellSlots: 2,
  },
  subclasses: [],
};

const mockBarbarian: CharacterClass = {
  name: 'Barbarian',
  hitDie: 12,
  primaryAbility: ['Strength'],
  savingThrows: ['Strength', 'Constitution'],
  armorProficiencies: ['light', 'medium', 'shields'],
  weaponProficiencies: ['simple', 'martial'],
  skillChoices: {
    options: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'],
    count: 2,
  },
  features: [
    {
      name: 'Rage',
      description: 'In battle, you fight with primal ferocity.',
    },
    {
      name: 'Unarmored Defense',
      description: 'While you are not wearing any armor, your Armor Class equals 10 + your Dexterity modifier + your Constitution modifier.',
    },
  ],
  subclasses: [],
};

const mockSorcerer: CharacterClass = {
  name: 'Sorcerer',
  hitDie: 6,
  primaryAbility: ['Charisma'],
  savingThrows: ['Constitution', 'Charisma'],
  armorProficiencies: [],
  weaponProficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'],
  skillChoices: {
    options: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
    count: 2,
  },
  features: [
    {
      name: 'Spellcasting',
      description: 'An event in your past, or in the life of a parent or ancestor, left an indelible mark on you.',
    },
    {
      name: 'Sorcerous Origin',
      description: 'Choose a sorcerous origin.',
    },
  ],
  spellcasting: {
    ability: 'Charisma',
    cantripsKnown: 4,
    spellSlots: 2,
    spellsPrepared: 2,
  },
  subclasses: [],
};

describe('getHitDie', () => {
  it('Fighter has d10 hit die', () => {
    const result = getHitDie(mockFighter);
    expect(result).toBe(10);
  });

  it('Wizard has d6 hit die', () => {
    const result = getHitDie(mockWizard);
    expect(result).toBe(6);
  });

  it('Barbarian has d12 hit die (largest)', () => {
    const result = getHitDie(mockBarbarian);
    expect(result).toBe(12);
  });

  it('Rogue has d8 hit die', () => {
    const result = getHitDie(mockRogue);
    expect(result).toBe(8);
  });

  it('Sorcerer has d6 hit die', () => {
    const result = getHitDie(mockSorcerer);
    expect(result).toBe(6);
  });
});

describe('getClassProficiencies', () => {
  it('Fighter has proficiency with all armor and shields', () => {
    const result = getClassProficiencies(mockFighter);
    expect(result.armor).toEqual(['light', 'medium', 'heavy', 'shields']);
  });

  it('Fighter has STR and CON saving throws', () => {
    const result = getClassProficiencies(mockFighter);
    expect(result.savingThrows).toEqual(['Strength', 'Constitution']);
    expect(result.savingThrows).toHaveLength(2);
  });

  it('Fighter has proficiency with simple and martial weapons', () => {
    const result = getClassProficiencies(mockFighter);
    expect(result.weapons).toEqual(['simple', 'martial']);
  });

  it('Wizard has no armor proficiency', () => {
    const result = getClassProficiencies(mockWizard);
    expect(result.armor).toEqual([]);
  });

  it('Wizard has INT and WIS saving throws', () => {
    const result = getClassProficiencies(mockWizard);
    expect(result.savingThrows).toEqual(['Intelligence', 'Wisdom']);
    expect(result.savingThrows).toHaveLength(2);
  });

  it('Cleric has proficiency with light and medium armor and shields', () => {
    const result = getClassProficiencies(mockCleric);
    expect(result.armor).toEqual(['light', 'medium', 'shields']);
  });

  it('Cleric has WIS and CHA saving throws', () => {
    const result = getClassProficiencies(mockCleric);
    expect(result.savingThrows).toEqual(['Wisdom', 'Charisma']);
  });

  it('Rogue has light armor only', () => {
    const result = getClassProficiencies(mockRogue);
    expect(result.armor).toEqual(['light']);
  });

  it('Rogue has DEX and INT saving throws', () => {
    const result = getClassProficiencies(mockRogue);
    expect(result.savingThrows).toEqual(['Dexterity', 'Intelligence']);
  });

  it('All classes have exactly 2 saving throw proficiencies', () => {
    const classes = [mockFighter, mockWizard, mockRogue, mockCleric, mockBarbarian, mockSorcerer];
    classes.forEach((charClass) => {
      const result = getClassProficiencies(charClass);
      expect(result.savingThrows).toHaveLength(2);
    });
  });
});

describe('getStartingEquipmentOptions', () => {
  it('Fighter returns equipment choices array', () => {
    const result = getStartingEquipmentOptions(mockFighter);
    expect(Array.isArray(result)).toBe(true);
  });

  it('Wizard returns equipment choices array', () => {
    const result = getStartingEquipmentOptions(mockWizard);
    expect(Array.isArray(result)).toBe(true);
  });

  it('All classes return an array (placeholder for v1)', () => {
    const classes = [mockFighter, mockWizard, mockRogue, mockCleric, mockBarbarian, mockSorcerer];
    classes.forEach((charClass) => {
      const result = getStartingEquipmentOptions(charClass);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe('getClassSkillChoices', () => {
  it('Rogue gets to choose 4 skills (most of any class)', () => {
    const result = getClassSkillChoices(mockRogue);
    expect(result.count).toBe(4);
  });

  it('Rogue has 11 skill options', () => {
    const result = getClassSkillChoices(mockRogue);
    expect(result.options).toHaveLength(11);
  });

  it('Fighter gets to choose 2 skills from 8 options', () => {
    const result = getClassSkillChoices(mockFighter);
    expect(result.count).toBe(2);
    expect(result.options).toHaveLength(8);
  });

  it('Wizard gets to choose 2 skills from 6 options', () => {
    const result = getClassSkillChoices(mockWizard);
    expect(result.count).toBe(2);
    expect(result.options).toHaveLength(6);
  });

  it('Cleric gets to choose 2 skills from 5 options', () => {
    const result = getClassSkillChoices(mockCleric);
    expect(result.count).toBe(2);
    expect(result.options).toHaveLength(5);
  });

  it('Fighter skill options include Athletics', () => {
    const result = getClassSkillChoices(mockFighter);
    expect(result.options).toContain('Athletics');
  });

  it('Wizard skill options include Arcana', () => {
    const result = getClassSkillChoices(mockWizard);
    expect(result.options).toContain('Arcana');
  });

  it('Rogue skill options include Stealth and Sleight of Hand', () => {
    const result = getClassSkillChoices(mockRogue);
    expect(result.options).toContain('Stealth');
    expect(result.options).toContain('Sleight of Hand');
  });
});
