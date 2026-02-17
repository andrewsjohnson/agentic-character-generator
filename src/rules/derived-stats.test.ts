import { describe, it, expect } from 'vitest';
import {
  SKILL_TO_ABILITY,
  getProficiencyBonus,
  calculateHP,
  calculateSkillModifiers,
  calculateSpellSaveDC,
  calculateSpellAttackModifier,
  calculatePassivePerception,
  calculateInitiative,
} from './derived-stats';
import type { AbilityModifiers } from '../types/ability';

describe('SKILL_TO_ABILITY', () => {
  it('maps all 18 standard D&D skills', () => {
    expect(Object.keys(SKILL_TO_ABILITY)).toHaveLength(18);
  });

  it('maps STR-based skills correctly', () => {
    expect(SKILL_TO_ABILITY['Athletics']).toBe('STR');
  });

  it('maps DEX-based skills correctly', () => {
    expect(SKILL_TO_ABILITY['Acrobatics']).toBe('DEX');
    expect(SKILL_TO_ABILITY['Sleight of Hand']).toBe('DEX');
    expect(SKILL_TO_ABILITY['Stealth']).toBe('DEX');
  });

  it('maps INT-based skills correctly', () => {
    expect(SKILL_TO_ABILITY['Arcana']).toBe('INT');
    expect(SKILL_TO_ABILITY['History']).toBe('INT');
    expect(SKILL_TO_ABILITY['Investigation']).toBe('INT');
    expect(SKILL_TO_ABILITY['Nature']).toBe('INT');
    expect(SKILL_TO_ABILITY['Religion']).toBe('INT');
  });

  it('maps WIS-based skills correctly', () => {
    expect(SKILL_TO_ABILITY['Animal Handling']).toBe('WIS');
    expect(SKILL_TO_ABILITY['Insight']).toBe('WIS');
    expect(SKILL_TO_ABILITY['Medicine']).toBe('WIS');
    expect(SKILL_TO_ABILITY['Perception']).toBe('WIS');
    expect(SKILL_TO_ABILITY['Survival']).toBe('WIS');
  });

  it('maps CHA-based skills correctly', () => {
    expect(SKILL_TO_ABILITY['Deception']).toBe('CHA');
    expect(SKILL_TO_ABILITY['Intimidation']).toBe('CHA');
    expect(SKILL_TO_ABILITY['Performance']).toBe('CHA');
    expect(SKILL_TO_ABILITY['Persuasion']).toBe('CHA');
  });
});

describe('getProficiencyBonus', () => {
  it('returns +2 for levels 1-4', () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(2)).toBe(2);
    expect(getProficiencyBonus(3)).toBe(2);
    expect(getProficiencyBonus(4)).toBe(2);
  });

  it('returns +3 for levels 5-8', () => {
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(6)).toBe(3);
    expect(getProficiencyBonus(7)).toBe(3);
    expect(getProficiencyBonus(8)).toBe(3);
  });

  it('returns +4 for levels 9-12', () => {
    expect(getProficiencyBonus(9)).toBe(4);
    expect(getProficiencyBonus(10)).toBe(4);
    expect(getProficiencyBonus(11)).toBe(4);
    expect(getProficiencyBonus(12)).toBe(4);
  });

  it('returns +5 for levels 13-16', () => {
    expect(getProficiencyBonus(13)).toBe(5);
    expect(getProficiencyBonus(14)).toBe(5);
    expect(getProficiencyBonus(15)).toBe(5);
    expect(getProficiencyBonus(16)).toBe(5);
  });

  it('returns +6 for levels 17-20', () => {
    expect(getProficiencyBonus(17)).toBe(6);
    expect(getProficiencyBonus(18)).toBe(6);
    expect(getProficiencyBonus(19)).toBe(6);
    expect(getProficiencyBonus(20)).toBe(6);
  });

  it('treats level 0 or negative as level 1 (returns +2)', () => {
    expect(getProficiencyBonus(0)).toBe(2);
    expect(getProficiencyBonus(-1)).toBe(2);
  });
});

describe('calculateHP', () => {
  it('calculates HP for a Fighter (d10) with CON +2', () => {
    expect(calculateHP(10, 2)).toBe(12);
  });

  it('calculates HP for a Wizard (d6) with CON -1', () => {
    expect(calculateHP(6, -1)).toBe(5);
  });

  it('calculates HP for a Barbarian (d12) with CON +3', () => {
    expect(calculateHP(12, 3)).toBe(15);
  });

  it('calculates HP for a Cleric (d8) with CON +0', () => {
    expect(calculateHP(8, 0)).toBe(8);
  });

  it('enforces minimum HP of 1 with very negative CON modifier', () => {
    expect(calculateHP(6, -10)).toBe(1);
  });

  it('enforces minimum HP of 1 when hitDie + conMod equals 0', () => {
    expect(calculateHP(6, -6)).toBe(1);
  });
});

describe('calculateSkillModifiers', () => {
  const baseModifiers: AbilityModifiers = {
    STR: 3,
    DEX: 2,
    CON: 1,
    INT: 0,
    WIS: -1,
    CHA: -2,
  };

  it('returns correct modifiers with no proficiencies', () => {
    const result = calculateSkillModifiers(baseModifiers, [], 2);

    expect(result['Athletics']).toBe(3);     // STR +3
    expect(result['Acrobatics']).toBe(2);    // DEX +2
    expect(result['Arcana']).toBe(0);        // INT +0
    expect(result['Perception']).toBe(-1);   // WIS -1
    expect(result['Deception']).toBe(-2);    // CHA -2
  });

  it('adds proficiency bonus for proficient skills', () => {
    const result = calculateSkillModifiers(baseModifiers, ['Athletics'], 2);

    expect(result['Athletics']).toBe(5);     // STR +3 + prof +2
  });

  it('does not add proficiency bonus for non-proficient skills', () => {
    const result = calculateSkillModifiers(baseModifiers, ['Athletics'], 2);

    expect(result['Acrobatics']).toBe(2);    // DEX +2, no proficiency
  });

  it('handles multiple proficiencies', () => {
    const result = calculateSkillModifiers(
      baseModifiers,
      ['Athletics', 'Perception', 'Stealth'],
      2,
    );

    expect(result['Athletics']).toBe(5);     // STR +3 + prof +2
    expect(result['Perception']).toBe(1);    // WIS -1 + prof +2
    expect(result['Stealth']).toBe(4);       // DEX +2 + prof +2
    expect(result['Arcana']).toBe(0);        // INT +0, not proficient
  });

  it('returns all 18 skills', () => {
    const result = calculateSkillModifiers(baseModifiers, [], 2);

    expect(Object.keys(result)).toHaveLength(18);
  });

  it('uses correct ability for each skill', () => {
    const distinctMods: AbilityModifiers = {
      STR: 1, DEX: 2, CON: 3, INT: 4, WIS: 5, CHA: 6,
    };

    const result = calculateSkillModifiers(distinctMods, [], 0);

    // STR skills
    expect(result['Athletics']).toBe(1);

    // DEX skills
    expect(result['Acrobatics']).toBe(2);
    expect(result['Sleight of Hand']).toBe(2);
    expect(result['Stealth']).toBe(2);

    // INT skills
    expect(result['Arcana']).toBe(4);
    expect(result['History']).toBe(4);
    expect(result['Investigation']).toBe(4);
    expect(result['Nature']).toBe(4);
    expect(result['Religion']).toBe(4);

    // WIS skills
    expect(result['Animal Handling']).toBe(5);
    expect(result['Insight']).toBe(5);
    expect(result['Medicine']).toBe(5);
    expect(result['Perception']).toBe(5);
    expect(result['Survival']).toBe(5);

    // CHA skills
    expect(result['Deception']).toBe(6);
    expect(result['Intimidation']).toBe(6);
    expect(result['Performance']).toBe(6);
    expect(result['Persuasion']).toBe(6);
  });

  it('works with higher proficiency bonuses', () => {
    const result = calculateSkillModifiers(baseModifiers, ['Athletics'], 4);

    expect(result['Athletics']).toBe(7);     // STR +3 + prof +4
  });
});

describe('calculateSpellSaveDC', () => {
  it('calculates DC with INT +3 and proficiency +2', () => {
    expect(calculateSpellSaveDC(3, 2)).toBe(13);
  });

  it('calculates DC with WIS +4 and proficiency +2', () => {
    expect(calculateSpellSaveDC(4, 2)).toBe(14);
  });

  it('calculates DC with CHA +0 and proficiency +2', () => {
    expect(calculateSpellSaveDC(0, 2)).toBe(10);
  });

  it('handles negative casting modifier', () => {
    expect(calculateSpellSaveDC(-1, 2)).toBe(9);
  });

  it('calculates DC with higher proficiency bonus', () => {
    expect(calculateSpellSaveDC(5, 6)).toBe(19);
  });
});

describe('calculateSpellAttackModifier', () => {
  it('calculates modifier with INT +3 and proficiency +2', () => {
    expect(calculateSpellAttackModifier(3, 2)).toBe(5);
  });

  it('calculates modifier with WIS +1 and proficiency +2', () => {
    expect(calculateSpellAttackModifier(1, 2)).toBe(3);
  });

  it('handles negative casting modifier', () => {
    expect(calculateSpellAttackModifier(-1, 2)).toBe(1);
  });

  it('calculates modifier with higher proficiency bonus', () => {
    expect(calculateSpellAttackModifier(5, 6)).toBe(11);
  });
});

describe('calculatePassivePerception', () => {
  it('calculates passive Perception with WIS +1, proficient, proficiency +2', () => {
    expect(calculatePassivePerception(1, true, 2)).toBe(13);
  });

  it('calculates passive Perception with WIS +2, not proficient, proficiency +2', () => {
    expect(calculatePassivePerception(2, false, 2)).toBe(12);
  });

  it('calculates passive Perception with WIS +0, proficient, proficiency +2', () => {
    expect(calculatePassivePerception(0, true, 2)).toBe(12);
  });

  it('handles negative WIS modifier without proficiency', () => {
    expect(calculatePassivePerception(-2, false, 2)).toBe(8);
  });

  it('handles negative WIS modifier with proficiency', () => {
    expect(calculatePassivePerception(-1, true, 2)).toBe(11);
  });

  it('matches the SRD example: WIS +2 with proficiency +2 = 14', () => {
    expect(calculatePassivePerception(2, true, 2)).toBe(14);
  });
});

describe('calculateInitiative', () => {
  it('returns DEX modifier of +3', () => {
    expect(calculateInitiative(3)).toBe(3);
  });

  it('returns DEX modifier of 0', () => {
    expect(calculateInitiative(0)).toBe(0);
  });

  it('returns negative DEX modifier', () => {
    expect(calculateInitiative(-1)).toBe(-1);
  });

  it('returns high DEX modifier', () => {
    expect(calculateInitiative(5)).toBe(5);
  });
});
