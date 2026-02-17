import { describe, it, expect } from 'vitest';
import {
  getHitDie,
  getClassProficiencies,
  getStartingEquipmentOptions,
  getFixedEquipment,
  getClassSkillChoices,
} from './classes';
import type { CharacterClass, WeaponProficiency } from '../types/class';

// Mock class data matching SRD specifications
const mockFighter: CharacterClass = {
  name: 'Fighter',
  hitDie: 10,
  primaryAbility: ['STR', 'DEX'],
  savingThrows: ['STR', 'CON'],
  armorProficiencies: ['light', 'medium', 'heavy', 'shields'],
  weaponProficiencies: ['simple', 'martial'],
  skillChoices: {
    options: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
    count: 2,
  },
  startingEquipment: {
    choices: [
      {
        description: 'Choose armor',
        options: [
          { label: 'Chain Mail', items: [{ name: 'Chain Mail' }] },
          { label: 'Leather Armor and Longbow with 20 arrows', items: [{ name: 'Leather Armor' }, { name: 'Longbow' }, { name: 'Arrows (20)' }] },
        ],
      },
      {
        description: 'Choose a martial weapon and shield, or two martial weapons',
        options: [
          { label: 'Martial weapon and shield', items: [{ name: 'Longsword' }, { name: 'Shield' }] },
          { label: 'Two martial weapons', items: [{ name: 'Longsword' }, { name: 'Handaxe' }] },
        ],
      },
      {
        description: 'Choose a ranged weapon',
        options: [
          { label: 'Light crossbow and 20 bolts', items: [{ name: 'Crossbow, Light' }, { name: 'Bolts (20)' }] },
          { label: 'Two handaxes', items: [{ name: 'Handaxe', quantity: 2 }] },
        ],
      },
    ],
    fixed: [],
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
  primaryAbility: ['INT'],
  savingThrows: ['INT', 'WIS'],
  armorProficiencies: [],
  weaponProficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'] as WeaponProficiency[],
  skillChoices: {
    options: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
    count: 2,
  },
  startingEquipment: {
    choices: [
      {
        description: 'Choose a weapon',
        options: [
          { label: 'Quarterstaff', items: [{ name: 'Quarterstaff' }] },
          { label: 'Dagger', items: [{ name: 'Dagger' }] },
        ],
      },
      {
        description: 'Choose a focus',
        options: [
          { label: 'Component pouch', items: [{ name: 'Component Pouch' }] },
          { label: 'Arcane focus', items: [{ name: 'Arcane Focus (Crystal)' }] },
        ],
      },
    ],
    fixed: [
      { name: 'Spellbook' },
    ],
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
    ability: 'INT',
    cantripsKnown: 3,
    spellSlots: 2,
    spellsPrepared: 6,
  },
  subclasses: [],
};

const mockRogue: CharacterClass = {
  name: 'Rogue',
  hitDie: 8,
  primaryAbility: ['DEX'],
  savingThrows: ['DEX', 'INT'],
  armorProficiencies: ['light'],
  weaponProficiencies: ['simple', 'hand crossbows', 'longswords', 'rapiers', 'shortswords'] as WeaponProficiency[],
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
  primaryAbility: ['WIS'],
  savingThrows: ['WIS', 'CHA'],
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
    ability: 'WIS',
    cantripsKnown: 3,
    spellSlots: 2,
  },
  subclasses: [],
};

const mockBarbarian: CharacterClass = {
  name: 'Barbarian',
  hitDie: 12,
  primaryAbility: ['STR'],
  savingThrows: ['STR', 'CON'],
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
  primaryAbility: ['CHA'],
  savingThrows: ['CON', 'CHA'],
  armorProficiencies: [],
  weaponProficiencies: ['daggers', 'darts', 'slings', 'quarterstaffs', 'light crossbows'] as WeaponProficiency[],
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
    ability: 'CHA',
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
    expect(result.savingThrows).toEqual(['STR', 'CON']);
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
    expect(result.savingThrows).toEqual(['INT', 'WIS']);
    expect(result.savingThrows).toHaveLength(2);
  });

  it('Cleric has proficiency with light and medium armor and shields', () => {
    const result = getClassProficiencies(mockCleric);
    expect(result.armor).toEqual(['light', 'medium', 'shields']);
  });

  it('Cleric has WIS and CHA saving throws', () => {
    const result = getClassProficiencies(mockCleric);
    expect(result.savingThrows).toEqual(['WIS', 'CHA']);
  });

  it('Rogue has light armor only', () => {
    const result = getClassProficiencies(mockRogue);
    expect(result.armor).toEqual(['light']);
  });

  it('Rogue has DEX and INT saving throws', () => {
    const result = getClassProficiencies(mockRogue);
    expect(result.savingThrows).toEqual(['DEX', 'INT']);
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
  it('Fighter has 3 equipment choices', () => {
    const result = getStartingEquipmentOptions(mockFighter);
    expect(result).toHaveLength(3);
  });

  it('Fighter first choice is armor with 2 options', () => {
    const result = getStartingEquipmentOptions(mockFighter);
    expect(result[0].description).toBe('Choose armor');
    expect(result[0].options).toHaveLength(2);
    expect(result[0].options[0].label).toBe('Chain Mail');
  });

  it('Wizard has 2 equipment choices', () => {
    const result = getStartingEquipmentOptions(mockWizard);
    expect(result).toHaveLength(2);
  });

  it('Wizard first choice options include Quarterstaff and Dagger', () => {
    const result = getStartingEquipmentOptions(mockWizard);
    expect(result[0].options[0].label).toBe('Quarterstaff');
    expect(result[0].options[1].label).toBe('Dagger');
  });

  it('returns empty array for class without startingEquipment', () => {
    const result = getStartingEquipmentOptions(mockRogue);
    expect(result).toEqual([]);
  });

  it('All classes return an array', () => {
    const classes = [mockFighter, mockWizard, mockRogue, mockCleric, mockBarbarian, mockSorcerer];
    classes.forEach((charClass) => {
      const result = getStartingEquipmentOptions(charClass);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe('getFixedEquipment', () => {
  it('Fighter has no fixed equipment', () => {
    const result = getFixedEquipment(mockFighter);
    expect(result).toEqual([]);
  });

  it('Wizard has Spellbook as fixed equipment', () => {
    const result = getFixedEquipment(mockWizard);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Spellbook');
  });

  it('returns empty array for class without startingEquipment', () => {
    const result = getFixedEquipment(mockRogue);
    expect(result).toEqual([]);
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
