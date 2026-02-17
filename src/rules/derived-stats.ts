import type { AbilityName, AbilityModifiers } from '../types/ability';
import type { HitDie } from '../types/class';
import { SKILL_NAMES } from '../types/skill';
import type { SkillName, SkillModifiers } from '../types/skill';

/**
 * Maps each of the 18 D&D 5e skills to its governing ability.
 * Skill names use the official SRD names with standard casing.
 */
export const SKILL_TO_ABILITY: Record<SkillName, AbilityName> = {
  'Acrobatics': 'DEX',
  'Animal Handling': 'WIS',
  'Arcana': 'INT',
  'Athletics': 'STR',
  'Deception': 'CHA',
  'History': 'INT',
  'Insight': 'WIS',
  'Intimidation': 'CHA',
  'Investigation': 'INT',
  'Medicine': 'WIS',
  'Nature': 'INT',
  'Perception': 'WIS',
  'Performance': 'CHA',
  'Persuasion': 'CHA',
  'Religion': 'INT',
  'Sleight of Hand': 'DEX',
  'Stealth': 'DEX',
  'Survival': 'WIS',
};

/**
 * Get the proficiency bonus for a given character level.
 * Formula: floor((level - 1) / 4) + 2
 *
 * @param level - The character level (1-20)
 * @returns The proficiency bonus
 *
 * @example
 * getProficiencyBonus(1)  // returns 2
 * getProficiencyBonus(5)  // returns 3
 * getProficiencyBonus(9)  // returns 4
 * getProficiencyBonus(17) // returns 6
 */
export function getProficiencyBonus(level: number): number {
  return Math.floor((Math.max(1, level) - 1) / 4) + 2;
}

/**
 * Calculate hit points at level 1.
 * Formula: hitDie + conModifier (minimum 1)
 *
 * @param hitDie - The class's hit die value (6, 8, 10, or 12)
 * @param conModifier - The Constitution ability modifier
 * @returns Hit points at level 1 (minimum 1)
 *
 * @example
 * calculateHP(10, 2)  // returns 12 (Fighter with CON +2)
 * calculateHP(6, -1)  // returns 5 (Wizard with CON -1)
 * calculateHP(12, 3)  // returns 15 (Barbarian with CON +3)
 */
export function calculateHP(hitDie: HitDie, conModifier: number): number {
  return Math.max(1, hitDie + conModifier);
}

/**
 * Calculate modifiers for all 18 skills.
 * Each skill modifier = ability modifier + proficiency bonus (if proficient).
 *
 * @param abilities - The character's ability modifiers
 * @param proficientSkills - Array of skill names the character is proficient in
 * @param proficiencyBonus - The character's proficiency bonus
 * @returns A record mapping each skill name to its total modifier
 *
 * @example
 * calculateSkillModifiers(
 *   { STR: 3, DEX: 2, CON: 1, INT: 0, WIS: -1, CHA: -2 },
 *   ['Athletics', 'Perception'],
 *   2
 * )
 * // Athletics: 3 + 2 = 5, Perception: -1 + 2 = 1, etc.
 */
export function calculateSkillModifiers(
  abilities: AbilityModifiers,
  proficientSkills: SkillName[],
  proficiencyBonus: number,
): SkillModifiers {
  const result: Partial<SkillModifiers> = {};

  for (const skill of SKILL_NAMES) {
    const ability = SKILL_TO_ABILITY[skill];
    const abilityMod = abilities[ability];
    const isProficient = proficientSkills.includes(skill);
    result[skill] = abilityMod + (isProficient ? proficiencyBonus : 0);
  }

  // All 18 skills are populated by the loop above, so the Partial is now complete.
  return result as SkillModifiers;
}

/**
 * Calculate the spell save DC for a spellcasting character.
 * Formula: 8 + spellcasting ability modifier + proficiency bonus
 *
 * @param castingAbilityModifier - The modifier for the class's spellcasting ability
 * @param proficiencyBonus - The character's proficiency bonus
 * @returns The spell save DC
 *
 * @example
 * calculateSpellSaveDC(3, 2)  // returns 13 (INT +3, proficiency +2)
 * calculateSpellSaveDC(4, 2)  // returns 14 (WIS +4, proficiency +2)
 */
export function calculateSpellSaveDC(
  castingAbilityModifier: number,
  proficiencyBonus: number,
): number {
  return 8 + castingAbilityModifier + proficiencyBonus;
}

/**
 * Calculate the spell attack modifier for a spellcasting character.
 * Formula: spellcasting ability modifier + proficiency bonus
 *
 * @param castingAbilityModifier - The modifier for the class's spellcasting ability
 * @param proficiencyBonus - The character's proficiency bonus
 * @returns The spell attack modifier
 *
 * @example
 * calculateSpellAttackModifier(3, 2)  // returns 5 (INT +3, proficiency +2)
 * calculateSpellAttackModifier(1, 2)  // returns 3 (WIS +1, proficiency +2)
 */
export function calculateSpellAttackModifier(
  castingAbilityModifier: number,
  proficiencyBonus: number,
): number {
  return castingAbilityModifier + proficiencyBonus;
}

/**
 * Calculate passive Perception.
 * Formula: 10 + Wisdom modifier + (proficiency bonus if proficient in Perception)
 *
 * @param wisdomModifier - The Wisdom ability modifier
 * @param isProficientInPerception - Whether the character is proficient in Perception
 * @param proficiencyBonus - The character's proficiency bonus
 * @returns The passive Perception score
 *
 * @example
 * calculatePassivePerception(1, true, 2)   // returns 13
 * calculatePassivePerception(2, false, 2)  // returns 12
 */
export function calculatePassivePerception(
  wisdomModifier: number,
  isProficientInPerception: boolean,
  proficiencyBonus: number,
): number {
  return 10 + wisdomModifier + (isProficientInPerception ? proficiencyBonus : 0);
}

/**
 * Calculate initiative modifier.
 * Initiative = Dexterity modifier.
 *
 * @param dexModifier - The Dexterity ability modifier
 * @returns The initiative modifier
 *
 * @example
 * calculateInitiative(3)  // returns 3
 * calculateInitiative(-1) // returns -1
 */
export function calculateInitiative(dexModifier: number): number {
  return dexModifier;
}
