import type {
  CharacterClass,
  HitDie,
  ArmorProficiency,
  WeaponProficiency,
} from '../types/class';
import type { AbilityName } from '../types/ability';
import type { EquipmentChoice, StartingEquipment, EquipmentRef } from '../types/equipment';

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
 * Each choice has a description and structured options with item references.
 * @param charClass - The character class
 * @returns Array of equipment choices the player must select from
 */
export function getStartingEquipmentOptions(
  charClass: CharacterClass
): EquipmentChoice[] {
  return charClass.startingEquipment?.choices ?? [];
}

/**
 * Returns the fixed equipment items every member of a class receives.
 * @param charClass - The character class
 * @returns Array of equipment item references
 */
export function getFixedEquipment(
  charClass: CharacterClass
): EquipmentRef[] {
  return charClass.startingEquipment?.fixed ?? [];
}

/**
 * Returns the full starting equipment configuration for a class.
 * @param charClass - The character class
 * @returns Starting equipment with choices and fixed items, or undefined if not configured
 */
export function getStartingEquipment(
  charClass: CharacterClass
): StartingEquipment | undefined {
  return charClass.startingEquipment;
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
