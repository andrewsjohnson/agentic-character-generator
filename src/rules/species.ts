import type { Species, Subspecies, SpeciesTrait } from '../types/species';
import type { AbilityBonuses, AbilityName } from '../types/ability';

/**
 * Returns the list of subspecies for a given species name.
 * If the species is not found or has no subspecies, returns an empty array.
 */
export function getSubspecies(
  speciesName: string,
  speciesData: Species[]
): Subspecies[] {
  const species = speciesData.find((s) => s.name === speciesName);
  return species?.subspecies ?? [];
}

/**
 * Combines ability score bonuses from a base species and optional subspecies.
 * If both define the same ability, the values are added together.
 * Returns an empty object if no bonuses are defined.
 */
export function getSpeciesBonuses(
  species: Species,
  subspecies?: Subspecies
): AbilityBonuses {
  const bonuses: AbilityBonuses = {};

  // Add base species bonuses
  if (species.abilityBonuses) {
    for (const ability in species.abilityBonuses) {
      const abilityName = ability as AbilityName;
      bonuses[abilityName] = species.abilityBonuses[abilityName] ?? 0;
    }
  }

  // Add subspecies bonuses (additive)
  if (subspecies?.abilityBonuses) {
    for (const ability in subspecies.abilityBonuses) {
      const abilityName = ability as AbilityName;
      const subspeciesBonus = subspecies.abilityBonuses[abilityName] ?? 0;
      bonuses[abilityName] = (bonuses[abilityName] ?? 0) + subspeciesBonus;
    }
  }

  return bonuses;
}

/**
 * Combines traits from a base species and optional subspecies.
 * Subspecies traits are appended to base species traits (not replacing).
 */
export function getSpeciesTraits(
  species: Species,
  subspecies?: Subspecies
): SpeciesTrait[] {
  const traits = [...species.traits];

  if (subspecies) {
    traits.push(...subspecies.traits);
  }

  return traits;
}

/**
 * Returns the effective speed for a species/subspecies combination.
 * Subspecies speed overrides base species speed (not additive).
 */
export function getSpeciesSpeed(
  species: Species,
  subspecies?: Subspecies
): number {
  return subspecies?.speed ?? species.speed;
}
