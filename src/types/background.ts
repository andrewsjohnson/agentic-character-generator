import type { EquipmentItem } from "./equipment";

/**
 * A background feature — the special narrative perk granted by a background
 * (e.g., Shelter of the Faithful, Criminal Contact).
 */
export type BackgroundFeature = {
  name: string;
  description: string;
};

/**
 * A character background as defined in the 5e SRD.
 */
export type Background = {
  name: string;
  skillProficiencies: [string, string];
  toolProficiencies: string[];
  languages: number;
  feature: BackgroundFeature;
  equipment: EquipmentItem[];
  /**
   * Suggested personality traits, ideals, bonds, and flaws.
   */
  personalityOptions?: {
    traits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
};

/**
 * The background-related choices a player has made during character creation.
 */
export type BackgroundSelection = {
  background: Background;
  personalityTraits?: [string, string];
  ideal?: string;
  bond?: string;
  flaw?: string;
};
