import type { Background } from '../types/background';

/**
 * Returns the skill proficiencies granted by the background.
 * @param background - The character background
 * @returns Tuple of exactly two skill names
 */
export function getBackgroundSkills(background: Background): [string, string] {
  return background.skillProficiencies;
}

/**
 * Returns the starting equipment granted by the background.
 * Equipment is formatted as "Item Name" for quantity 1,
 * or "Item Name (xN)" for quantity > 1.
 * @param background - The character background
 * @returns Array of equipment item strings
 */
export function getBackgroundEquipment(background: Background): string[] {
  return background.equipment.map((item) => {
    if (item.quantity > 1) {
      return `${item.name} (x${item.quantity})`;
    }
    return item.name;
  });
}

/**
 * Returns any additional language or tool proficiency choices
 * the background grants.
 * For v1, this returns an empty array as the Background type
 * does not include language/tool choice fields yet. This will
 * be implemented in a future phase when proficiency choices
 * are added to the type definition.
 * @param _background - The character background (unused in v1)
 * @returns Array of language/tool choice objects
 */
export function getBackgroundLanguagesOrTools(
  _background: Background // eslint-disable-line @typescript-eslint/no-unused-vars
): { type: 'language' | 'tool'; options: string[]; count: number }[] {
  // Placeholder for v1 - language/tool choices to be implemented later
  // This function ensures the interface is ready for future implementation
  return [];
}

/**
 * Checks for skill conflicts between background and class skills.
 * Returns any skills that appear in both the background's granted
 * skills and the class's chosen skills. These conflicts must be
 * resolved by allowing the player to pick replacement skills.
 * @param backgroundSkills - Skills granted by the background
 * @param classSkills - Skills already chosen from the class
 * @returns Array of conflicting skill names
 */
export function hasSkillConflict(
  backgroundSkills: string[],
  classSkills: string[]
): string[] {
  // Create a Set for O(1) lookup of class skills
  const classSkillSet = new Set(classSkills);

  // Return background skills that exist in the class skill set
  return backgroundSkills.filter((skill) => classSkillSet.has(skill));
}
