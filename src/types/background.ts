import type { AbilityName } from './ability';
import type { SkillName } from './skill';

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

/** A character background from the SRD. */
export type Background = {
  name: string;
  /** Three abilities this background can increase. Player chooses +2/+1 or +1/+1/+1 split. */
  abilityOptions: [AbilityName, AbilityName, AbilityName];
  skillProficiencies: [SkillName, SkillName];
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
