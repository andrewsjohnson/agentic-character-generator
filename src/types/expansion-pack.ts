import type { Species } from './species';
import type { CharacterClass } from './class';
import type { Background } from './background';
import type { EquipmentItem } from './equipment';

/** An expansion pack that adds optional content to the character generator. */
export type ExpansionPack = {
  /** Unique identifier used to track which packs are enabled. */
  id: string;
  /** Display name shown in the UI and used as section header when content is enabled. */
  name: string;
  /** Short description shown in the expansion pack toggle UI. */
  description: string;
  species?: Species[];
  classes?: CharacterClass[];
  backgrounds?: Background[];
  equipment?: EquipmentItem[];
};

/** A group of items from a single source (base content or a named expansion pack). */
export type ContentGroup<T> = {
  /** "Base Content" for core SRD data, or the expansion pack's name. */
  source: string;
  items: T[];
};

/** All available content, grouped by source, for use in step selection UIs. */
export type AvailableContent = {
  species: ContentGroup<Species>[];
  classes: ContentGroup<CharacterClass>[];
  backgrounds: ContentGroup<Background>[];
};
