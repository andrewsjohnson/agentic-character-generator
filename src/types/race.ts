import type { AbilityBonuses } from './ability';

/** A racial trait granted by a race or subrace. */
export type RacialTrait = {
  name: string;
  description: string;
};

/** A subrace within a parent race (e.g. Hill Dwarf, High Elf). */
export type Subrace = {
  name: string;
  abilityBonuses: AbilityBonuses;
  traits: RacialTrait[];
};

/** A playable race from the SRD. */
export type Race = {
  name: string;
  speed: number;
  size: 'Small' | 'Medium';
  /** Darkvision range in feet, or 0 if the race lacks darkvision. */
  darkvision: number;
  abilityBonuses: AbilityBonuses;
  traits: RacialTrait[];
  languages: string[];
  subraces: Subrace[];
};
