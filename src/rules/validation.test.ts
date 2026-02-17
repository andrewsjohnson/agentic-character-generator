import { describe, it, expect } from 'vitest';
import {
  validateSpeciesStep,
  validateClassStep,
  validateAbilityScoresStep,
  validateBackgroundStep,
  validateEquipmentStep,
  validateCharacter,
} from './validation';
import type { CharacterDraft } from '../types/character';
import type { Species, Subspecies } from '../types/species';
import type { CharacterClass } from '../types/class';
import type { Background } from '../types/background';
import type { EquipmentItem } from '../types/equipment';
import type { AbilityScores } from '../types/ability';

// --- Test data helpers ---

function makeSpecies(overrides: Partial<Species> = {}): Species {
  return {
    name: 'Dragonborn',
    speed: 30,
    size: 'Medium',
    traits: [],
    languages: ['Common', 'Draconic'],
    subspecies: [],
    ...overrides,
  };
}

function makeSubspecies(overrides: Partial<Subspecies> = {}): Subspecies {
  return {
    name: 'Hill Dwarf',
    traits: [{ name: 'Dwarven Toughness', description: 'HP +1 per level' }],
    ...overrides,
  };
}

function makeClass(overrides: Partial<CharacterClass> = {}): CharacterClass {
  return {
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
            { label: 'Leather Armor', items: [{ name: 'Leather Armor' }] },
          ],
        },
      ],
      fixed: [],
    },
    features: [],
    subclasses: [],
    ...overrides,
  };
}

function makeBackground(overrides: Partial<Background> = {}): Background {
  return {
    name: 'Soldier',
    abilityOptions: ['STR', 'DEX', 'CON'],
    skillProficiencies: ['Athletics', 'Intimidation'],
    toolProficiency: 'Gaming Set (choose one)',
    equipment: [{ name: 'Spear', quantity: 1 }],
    feature: { name: 'Military Rank', description: 'Soldiers defer to you.' },
    originFeat: 'Savage Attacker',
    personalityTraits: [],
    ideals: [],
    bonds: [],
    flaws: [],
    ...overrides,
  };
}

function makeStandardArrayScores(): AbilityScores {
  return { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 };
}

function makeValidPointBuyScores(): AbilityScores {
  // 5+5+5+5+5+2 = 27 points (distinct from standard array)
  return { STR: 13, DEX: 13, CON: 13, INT: 13, WIS: 13, CHA: 10 };
}

function makeEquipment(): EquipmentItem[] {
  return [
    {
      kind: 'armor',
      name: 'Chain Mail',
      category: 'heavy',
      baseAC: 16,
      addDex: false,
      stealthDisadvantage: true,
      weight: 55,
      cost: '75 gp',
    },
    {
      kind: 'weapon',
      name: 'Longsword',
      category: 'martial',
      damage: '1d8',
      damageType: 'slashing',
      properties: ['versatile'],
      weight: 3,
      cost: '15 gp',
    },
  ];
}

// --- Tests ---

describe('validateSpeciesStep', () => {
  it('returns valid when species is selected (no subspecies required)', () => {
    const character: CharacterDraft = {
      species: makeSpecies(), // Dragonborn has no subspecies
    };

    const result = validateSpeciesStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns valid when species and required subspecies are selected', () => {
    const dwarf = makeSpecies({
      name: 'Dwarf',
      speed: 25,
      subspecies: [makeSubspecies()],
    });
    const character: CharacterDraft = {
      species: dwarf,
      subspecies: makeSubspecies(),
    };

    const result = validateSpeciesStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns invalid when no species is selected', () => {
    const character: CharacterDraft = {};

    const result = validateSpeciesStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Species must be selected.');
  });

  it('returns invalid when species requires subspecies but none selected', () => {
    const dwarf = makeSpecies({
      name: 'Dwarf',
      speed: 25,
      subspecies: [makeSubspecies()],
    });
    const character: CharacterDraft = {
      species: dwarf,
      // no subspecies selected
    };

    const result = validateSpeciesStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Subspecies must be selected for this species.');
  });
});

describe('validateClassStep', () => {
  it('returns valid when class is selected', () => {
    const character: CharacterDraft = {
      class: makeClass(),
    };

    const result = validateClassStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns invalid when no class is selected', () => {
    const character: CharacterDraft = {};

    const result = validateClassStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Class must be selected.');
  });
});

describe('validateAbilityScoresStep', () => {
  it('returns valid for point buy with exact 27 points', () => {
    const character: CharacterDraft = {
      abilityScoreMethod: 'point-buy',
      baseAbilityScores: makeValidPointBuyScores(),
    };

    const result = validateAbilityScoresStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns valid for point buy under budget', () => {
    const character: CharacterDraft = {
      abilityScoreMethod: 'point-buy',
      baseAbilityScores: { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 }, // 0 points
    };

    const result = validateAbilityScoresStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns valid for standard array in standard order', () => {
    const character: CharacterDraft = {
      abilityScoreMethod: 'standard-array',
      baseAbilityScores: makeStandardArrayScores(),
    };

    const result = validateAbilityScoresStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns valid for standard array in different order', () => {
    const character: CharacterDraft = {
      abilityScoreMethod: 'standard-array',
      baseAbilityScores: { STR: 8, DEX: 10, CON: 12, INT: 13, WIS: 14, CHA: 15 },
    };

    const result = validateAbilityScoresStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns valid for manual method with any scores', () => {
    const character: CharacterDraft = {
      abilityScoreMethod: 'manual',
      baseAbilityScores: { STR: 18, DEX: 16, CON: 14, INT: 12, WIS: 10, CHA: 6 },
    };

    const result = validateAbilityScoresStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns invalid when no ability scores are assigned', () => {
    const character: CharacterDraft = {};

    const result = validateAbilityScoresStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Ability score method must be selected.');
    expect(result.errors).toContain('Ability scores must be assigned.');
  });

  it('returns invalid when no method is specified', () => {
    const character: CharacterDraft = {
      baseAbilityScores: makeStandardArrayScores(),
    };

    const result = validateAbilityScoresStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Ability score method must be selected.');
  });

  it('returns invalid for point buy over budget', () => {
    const character: CharacterDraft = {
      abilityScoreMethod: 'point-buy',
      baseAbilityScores: { STR: 15, DEX: 15, CON: 15, INT: 15, WIS: 15, CHA: 15 }, // 54 points
    };

    const result = validateAbilityScoresStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Point buy scores are invalid. All scores must be 8\u201315 and total cost must not exceed 27 points.'
    );
  });

  it('returns invalid for point buy with score outside 8-15 range', () => {
    const character: CharacterDraft = {
      abilityScoreMethod: 'point-buy',
      baseAbilityScores: { STR: 16, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
    };

    const result = validateAbilityScoresStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Point buy scores are invalid. All scores must be 8\u201315 and total cost must not exceed 27 points.'
    );
  });

  it('returns invalid for standard array with wrong values', () => {
    const character: CharacterDraft = {
      abilityScoreMethod: 'standard-array',
      baseAbilityScores: { STR: 15, DEX: 15, CON: 13, INT: 12, WIS: 10, CHA: 8 },
    };

    const result = validateAbilityScoresStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Standard array values must be exactly 15, 14, 13, 12, 10, and 8 (in any order).'
    );
  });
});

describe('validateBackgroundStep', () => {
  it('returns valid when background is selected with no skill conflicts', () => {
    // Sage background (Arcana, History) + Fighter class choosing Perception, Survival
    const sage = makeBackground({
      name: 'Sage',
      skillProficiencies: ['Arcana', 'History'],
    });
    const character: CharacterDraft = {
      class: makeClass(),
      background: sage,
      skillProficiencies: ['Perception', 'Survival', 'Arcana', 'History'],
    };

    const result = validateBackgroundStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns valid when background skill conflicts have been resolved', () => {
    // Soldier background (Athletics, Intimidation) + Fighter choosing Athletics, Perception
    // Conflict on Athletics - resolved by replacing with another skill
    const character: CharacterDraft = {
      class: makeClass(),
      background: makeBackground(), // Soldier: Athletics, Intimidation
      // Class chose Athletics + Perception; background has Athletics (conflict) + Intimidation
      // Conflict resolved: replaced Athletics with Survival
      skillProficiencies: ['Athletics', 'Perception', 'Survival', 'Intimidation'],
      backgroundSkillReplacements: { 'Athletics': 'Survival' } as Record<import('../types/skill').SkillName, import('../types/skill').SkillName>,
    };

    const result = validateBackgroundStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns invalid when conflicts exist but not resolved', () => {
    // Soldier background (Athletics, Intimidation) + Fighter choosing Athletics, Perception
    // Conflict on Athletics - NOT resolved (no backgroundSkillReplacements)
    const character: CharacterDraft = {
      class: makeClass(),
      background: makeBackground(), // Soldier: Athletics, Intimidation
      skillProficiencies: ['Athletics', 'Perception'],
      // backgroundSkillReplacements not set
    };

    const result = validateBackgroundStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('You must resolve all skill conflicts before proceeding.');
  });

  it('returns valid when no conflicts exist (no replacements needed)', () => {
    // Sage background (Arcana, History) - no overlap with Fighter's class skills
    const sage = makeBackground({
      name: 'Sage',
      skillProficiencies: ['Arcana', 'History'],
    });
    const character: CharacterDraft = {
      class: makeClass(),
      background: sage,
      skillProficiencies: ['Perception', 'Survival', 'Arcana', 'History'],
      // No backgroundSkillReplacements needed
    };

    const result = validateBackgroundStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns invalid when no background is selected', () => {
    const character: CharacterDraft = {};

    const result = validateBackgroundStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Background must be selected.');
  });

  it('returns invalid when skill proficiencies have not been set', () => {
    const character: CharacterDraft = {
      class: makeClass(),
      background: makeBackground(),
      // skillProficiencies not set
    };

    const result = validateBackgroundStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Skill proficiencies must be selected.');
  });
});

describe('validateEquipmentStep', () => {
  it('returns valid when equipment is populated', () => {
    const character: CharacterDraft = {
      class: makeClass(),
      equipment: makeEquipment(),
    };

    const result = validateEquipmentStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns valid when class has no equipment choices', () => {
    const classWithNoChoices = makeClass({
      startingEquipment: { choices: [], fixed: [] },
    });
    const character: CharacterDraft = {
      class: classWithNoChoices,
    };

    const result = validateEquipmentStep(character);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns invalid when no equipment is selected but class has choices', () => {
    const character: CharacterDraft = {
      class: makeClass(),
      // equipment not set
    };

    const result = validateEquipmentStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Starting equipment must be selected.');
  });

  it('returns invalid when equipment array is empty but class has choices', () => {
    const character: CharacterDraft = {
      class: makeClass(),
      equipment: [],
    };

    const result = validateEquipmentStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Starting equipment must be selected.');
  });

  it('returns invalid when class is not selected', () => {
    const character: CharacterDraft = {};

    const result = validateEquipmentStep(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Class must be selected before choosing equipment.');
  });
});

describe('validateCharacter', () => {
  function makeCompleteCharacter(): CharacterDraft {
    return {
      species: makeSpecies(),
      class: makeClass(),
      abilityScoreMethod: 'standard-array',
      baseAbilityScores: makeStandardArrayScores(),
      background: makeBackground({
        name: 'Sage',
        skillProficiencies: ['Arcana', 'History'],
      }),
      skillProficiencies: ['Perception', 'Survival', 'Arcana', 'History'],
      equipment: makeEquipment(),
    };
  }

  it('returns valid for a fully completed character', () => {
    const result = validateCharacter(makeCompleteCharacter());

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns invalid when species step is missing', () => {
    const character = makeCompleteCharacter();
    delete character.species;

    const result = validateCharacter(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Species must be selected.');
  });

  it('returns invalid when class step is missing', () => {
    const character = makeCompleteCharacter();
    delete character.class;

    const result = validateCharacter(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Class must be selected.');
  });

  it('returns invalid when ability scores step is missing', () => {
    const character = makeCompleteCharacter();
    delete character.baseAbilityScores;
    delete character.abilityScoreMethod;

    const result = validateCharacter(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Ability score method must be selected.');
    expect(result.errors).toContain('Ability scores must be assigned.');
  });

  it('returns invalid when background step is missing', () => {
    const character = makeCompleteCharacter();
    delete character.background;

    const result = validateCharacter(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Background must be selected.');
  });

  it('returns invalid when equipment step is missing', () => {
    const character = makeCompleteCharacter();
    delete character.equipment;

    const result = validateCharacter(character);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Starting equipment must be selected.');
  });

  it('collects errors from multiple invalid steps', () => {
    const character: CharacterDraft = {};

    const result = validateCharacter(character);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
    expect(result.errors).toContain('Species must be selected.');
    expect(result.errors).toContain('Class must be selected.');
    expect(result.errors).toContain('Ability score method must be selected.');
    expect(result.errors).toContain('Background must be selected.');
  });
});
