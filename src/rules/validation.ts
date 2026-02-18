import type { CharacterDraft } from '../types/character';
import { ABILITY_NAMES } from '../types/ability';
import { isValidPointBuy, isValidStandardArray } from './ability-scores';
import { getBackgroundSkills } from './backgrounds';
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

  const baseAbilityScores = character.baseAbilityScores;

  // Check all six abilities are present
  const missingAbilities = ABILITY_NAMES.filter(
    (ability) => baseAbilityScores[ability] === undefined
  );
  if (missingAbilities.length > 0) {
    errors.push(`Missing ability scores: ${missingAbilities.join(', ')}.`);
    return { valid: false, errors };
  }

  // Validate based on method
  if (character.abilityScoreMethod === 'point-buy') {
    if (!isValidPointBuy(baseAbilityScores)) {
      errors.push('Point buy scores are invalid. All scores must be 8\u201315 and total cost must not exceed 27 points.');
    }
  } else if (character.abilityScoreMethod === 'standard-array') {
    if (!isValidStandardArray(baseAbilityScores)) {
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

  // Check for unresolved skill conflicts.
  // When a background with conflicting skills is selected, the user must resolve
  // the conflicts before proceeding.
  //
  // After the background step completes properly, skillProficiencies should contain
  // classSkillCount + 2 skills (2 from background, either original or replacements).
  // If skillProficiencies has fewer than expected, background skills haven't been
  // merged yet — indicating unresolved conflicts.
  if (character.class && character.skillProficiencies) {
    const backgroundSkills = getBackgroundSkills(character.background);
    const expectedCount = character.class.skillChoices.count + backgroundSkills.length;

    if (character.skillProficiencies.length < expectedCount) {
      // Background skills haven't been merged — conflicts are unresolved.
      // Verify that backgroundSkillReplacements accounts for all missing skills.
      const missingCount = expectedCount - character.skillProficiencies.length;
      const resolvedCount = character.backgroundSkillReplacements
        ? Object.keys(character.backgroundSkillReplacements).length
        : 0;

      if (resolvedCount !== missingCount) {
        errors.push('You must resolve all skill conflicts before proceeding.');
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
