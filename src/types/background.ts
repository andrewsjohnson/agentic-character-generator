/** Equipment granted by a background (name and quantity). */
export type BackgroundEquipment = {
  name: string;
  quantity: number;
};

/** A background feature (e.g. Shelter of the Faithful). */
export type BackgroundFeature = {
  name: string;
  description: string;
};

import type { AbilityName } from './ability';

/** A character background from the SRD. */
export type Background = {
  name: string;
  /** Three abilities this background can increase. Player chooses +2/+1 or +1/+1/+1 split. */
  abilityOptions: [AbilityName, AbilityName, AbilityName];
  skillProficiencies: [string, string];
  toolProficiency: string;
  equipment: BackgroundEquipment[];
  feature: BackgroundFeature;
  /** Origin feat granted by this background. */
  originFeat: string;
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
};
