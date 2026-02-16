import type { AbilityBonuses } from './ability';

/** A species trait granted by a species or subspecies. */
export type SpeciesTrait = {
  name: string;
  description: string;
};

/** A subspecies within a parent species (e.g. Hill Dwarf, High Elf). */
export type Subspecies = {
  name: string;
  traits: SpeciesTrait[];
  abilityBonuses?: AbilityBonuses;
  speed?: number;
};

/** A playable species from the SRD. */
export type Species = {
  name: string;
  speed: number;
  size: 'Small' | 'Medium';
  traits: SpeciesTrait[];
  languages: string[];
  subspecies: Subspecies[];
  abilityBonuses?: AbilityBonuses;
};
