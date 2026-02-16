import type {
  CharacterClass,
  HitDie,
  ArmorProficiency,
  WeaponProficiency,
} from '../types/class';
import type { AbilityName } from '../types/ability';
import type { EquipmentChoice } from '../types/equipment';

/**
 * Returns the hit die size for a given class.
 * @param charClass - The character class
 * @returns Hit die size (6, 8, 10, or 12)
 */
export function getHitDie(charClass: CharacterClass): HitDie {
  return charClass.hitDie;
}

/**
 * Returns all proficiency grants for a class.
 * @param charClass - The character class
 * @returns Object containing armor, weapons, and saving throw proficiencies
 */
export function getClassProficiencies(charClass: CharacterClass): {
  armor: ArmorProficiency[];
  weapons: WeaponProficiency[];
  savingThrows: [AbilityName, AbilityName];
} {
  return {
    armor: charClass.armorProficiencies,
    weapons: charClass.weaponProficiencies,
    savingThrows: charClass.savingThrows,
  };
}

/**
 * Returns the equipment choices available at level 1.
 * For v1, this returns an empty array as equipment choices will be
 * implemented in a future phase.
 * @param charClass - The character class
 * @returns Array of equipment choices
 */
export function getStartingEquipmentOptions(
  charClass: CharacterClass
): EquipmentChoice[] {
  // Placeholder for v1 - equipment choices to be implemented later
  // This function ensures the interface is ready for future implementation
  return [];
}

/**
 * Returns the skills the class can choose from and how many may be picked.
 * @param charClass - The character class
 * @returns Object with skill options array and count of choices allowed
 */
export function getClassSkillChoices(charClass: CharacterClass): {
  options: string[];
  count: number;
} {
  return charClass.skillChoices;
}
