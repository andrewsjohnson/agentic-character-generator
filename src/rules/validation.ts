import type { CharacterDraft } from '../types/character';
import { ABILITY_NAMES } from '../types/ability';
import { isValidPointBuy, isValidStandardArray } from './ability-scores';
import { hasSkillConflict, getBackgroundSkills } from './backgrounds';
import { getStartingEquipmentOptions } from './classes';

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

/**
 * Validate the species step. Ensures a species is selected
 * and, if the species has subspecies options, one is chosen.
 */
export function validateSpeciesStep(character: CharacterDraft): ValidationResult {
  const errors: string[] = [];

  if (!character.species) {
    errors.push('Species must be selected.');
    return { valid: false, errors };
  }

  if (character.species.subspecies.length > 0 && !character.subspecies) {
    errors.push('Subspecies must be selected for this species.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate the class step. Ensures a class is selected.
 */
export function validateClassStep(character: CharacterDraft): ValidationResult {
  const errors: string[] = [];

  if (!character.class) {
    errors.push('Class must be selected.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate the ability scores step. Checks that a method is chosen,
 * all six scores are present, and scores are valid for the chosen method.
 */
export function validateAbilityScoresStep(character: CharacterDraft): ValidationResult {
  const errors: string[] = [];

  if (!character.abilityScoreMethod) {
    errors.push('Ability score method must be selected.');
  }

  if (!character.baseAbilityScores) {
    errors.push('Ability scores must be assigned.');
    return { valid: false, errors };
  }

  // Check all six abilities are present
  const missingAbilities = ABILITY_NAMES.filter(
    (ability) => character.baseAbilityScores![ability] === undefined
  );
  if (missingAbilities.length > 0) {
    errors.push(`Missing ability scores: ${missingAbilities.join(', ')}.`);
    return { valid: false, errors };
  }

  // Validate based on method
  if (character.abilityScoreMethod === 'point-buy') {
    if (!isValidPointBuy(character.baseAbilityScores)) {
      errors.push('Point buy scores are invalid. All scores must be 8\u201315 and total cost must not exceed 27 points.');
    }
  } else if (character.abilityScoreMethod === 'standard-array') {
    if (!isValidStandardArray(character.baseAbilityScores)) {
      errors.push('Standard array values must be exactly 15, 14, 13, 12, 10, and 8 (in any order).');
    }
  }
  // 'manual' method accepts any scores — no additional validation

  return { valid: errors.length === 0, errors };
}

/**
 * Validate the background step. Ensures a background is selected
 * and any skill conflicts with class skills have been resolved.
 */
export function validateBackgroundStep(character: CharacterDraft): ValidationResult {
  const errors: string[] = [];

  if (!character.background) {
    errors.push('Background must be selected.');
    return { valid: false, errors };
  }

  // Check for unresolved skill conflicts
  if (character.class && character.skillProficiencies) {
    const backgroundSkills = getBackgroundSkills(character.background);
    const classSkills = character.skillProficiencies.filter(
      (skill) => !backgroundSkills.includes(skill)
    );
    const conflicts = hasSkillConflict(backgroundSkills, classSkills);

    // If there are conflicts, check whether the character's skillProficiencies
    // includes *both* background skills (possibly as replacements).
    // When conflicts are resolved, the background step replaces conflicting
    // skills with alternatives, so all background skills should be present
    // in the final list (either original or replacement).
    if (conflicts.length > 0) {
      // The character has conflicts. The total skill count should reflect
      // that replacements were made. If skillProficiencies doesn't contain
      // at least (classSkills.length + backgroundSkills.length) entries,
      // the conflicts haven't been resolved.
      const expectedCount = classSkills.length + backgroundSkills.length;
      if (character.skillProficiencies.length < expectedCount) {
        errors.push('Skill conflicts between class and background must be resolved.');
      }
    }
  } else if (character.class && !character.skillProficiencies) {
    // Background is selected but skill proficiencies haven't been set yet
    errors.push('Skill proficiencies must be selected.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate the equipment step. Ensures equipment has been selected
 * when the class has equipment choices.
 */
export function validateEquipmentStep(character: CharacterDraft): ValidationResult {
  const errors: string[] = [];

  if (!character.class) {
    errors.push('Class must be selected before choosing equipment.');
    return { valid: false, errors };
  }

  const equipmentChoices = getStartingEquipmentOptions(character.class);

  // If the class has equipment choices, equipment must be populated
  if (equipmentChoices.length > 0) {
    if (!character.equipment || character.equipment.length === 0) {
      errors.push('Starting equipment must be selected.');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate the entire character by running all step validations.
 * Returns combined results with all errors aggregated.
 */
export function validateCharacter(character: CharacterDraft): ValidationResult {
  const allErrors: string[] = [];

  const steps = [
    validateSpeciesStep(character),
    validateClassStep(character),
    validateAbilityScoresStep(character),
    validateBackgroundStep(character),
    validateEquipmentStep(character),
  ];

  for (const result of steps) {
    allErrors.push(...result.errors);
  }

  return { valid: allErrors.length === 0, errors: allErrors };
}
