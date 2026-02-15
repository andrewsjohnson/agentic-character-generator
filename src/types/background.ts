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
  skillProficiencies: [string, string];
  toolProficiencies: string[];
  languages: number;
  equipment: BackgroundEquipment[];
  feature: BackgroundFeature;
  personalityTraits: string[];
  ideals: string[];
  bonds: string[];
  flaws: string[];
};
