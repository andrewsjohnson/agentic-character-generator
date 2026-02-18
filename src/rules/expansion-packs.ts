import type { Species } from '../types/species';
import type { CharacterClass } from '../types/class';
import type { Background } from '../types/background';
import type { ExpansionPack, AvailableContent } from '../types/expansion-pack';

type BaseContent = {
  species: Species[];
  classes: CharacterClass[];
  backgrounds: Background[];
};

/**
 * Builds the full available content by combining base SRD content with any
 * enabled expansion packs. Each source becomes a named ContentGroup so the UI
 * can render section headers (e.g. "Base Content", "Mythic Realms").
 *
 * Pure function — no side effects or React dependency.
 */
export function computeAvailableContent(
  enabledPackIds: string[],
  expansionPacks: ExpansionPack[],
  baseContent: BaseContent
): AvailableContent {
  const result: AvailableContent = {
    species: [{ source: 'Base Content', items: baseContent.species }],
    classes: [{ source: 'Base Content', items: baseContent.classes }],
    backgrounds: [{ source: 'Base Content', items: baseContent.backgrounds }],
  };

  for (const pack of expansionPacks) {
    if (!enabledPackIds.includes(pack.id)) continue;

    if (pack.species && pack.species.length > 0) {
      result.species.push({ source: pack.name, items: pack.species });
    }
    if (pack.classes && pack.classes.length > 0) {
      result.classes.push({ source: pack.name, items: pack.classes });
    }
    if (pack.backgrounds && pack.backgrounds.length > 0) {
      result.backgrounds.push({ source: pack.name, items: pack.backgrounds });
    }
  }

  return result;
}
