import type { Species } from '../types/species';
import type { CharacterClass } from '../types/class';
import type { Background } from '../types/background';
import type { CharacterDraft } from '../types/character';
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

/**
 * Returns the character fields that should be cleared because their current
 * selection is no longer present in the available content.
 *
 * Pure function — call after availableContent changes (e.g. pack toggled off).
 */
export function findStaleSelections(
  character: CharacterDraft,
  availableContent: AvailableContent
): Partial<CharacterDraft> {
  const updates: Partial<CharacterDraft> = {};

  const allSpeciesNames = availableContent.species.flatMap(g => g.items.map(s => s.name));
  const allClassNames = availableContent.classes.flatMap(g => g.items.map(c => c.name));
  const allBackgroundNames = availableContent.backgrounds.flatMap(g => g.items.map(b => b.name));

  if (character.species && !allSpeciesNames.includes(character.species.name)) {
    updates.species = undefined;
    updates.subspecies = undefined;
  }

  if (character.class && !allClassNames.includes(character.class.name)) {
    updates.class = undefined;
    updates.subclass = undefined;
    updates.skillProficiencies = undefined;
    updates.cantripsKnown = undefined;
    updates.spellsKnown = undefined;
  }

  if (character.background && !allBackgroundNames.includes(character.background.name)) {
    updates.background = undefined;
    updates.backgroundSkillReplacements = undefined;
    updates.originFeat = undefined;
    // Background skills need to be removed. Since skills are a merged list
    // and we can't easily separate them, clear and let the user re-select.
    updates.skillProficiencies = undefined;
  }

  return updates;
}
