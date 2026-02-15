import type { AbilityBonuses } from "./ability";

/**
 * A racial trait granted by a race or subrace (e.g., Darkvision,
 * Fey Ancestry, Dwarven Resilience).
 */
export type RacialTrait = {
  name: string;
  description: string;
};

/**
 * A subrace that further specializes a base race (e.g., Hill Dwarf, High Elf).
 */
export type Subrace = {
  name: string;
  abilityBonuses: AbilityBonuses;
  traits: RacialTrait[];
};

/**
 * A playable race as defined in the 5e SRD.
 */
export type Race = {
  name: string;
  abilityBonuses: AbilityBonuses;
  speed: number;
  size: "Small" | "Medium";
  languages: string[];
  traits: RacialTrait[];
  subraces: Subrace[];
};

/**
 * The race-related choices a player has made during character creation.
 */
export type RaceSelection = {
  race: Race;
  subrace?: Subrace;
};
