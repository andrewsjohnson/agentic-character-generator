import type { CharacterDraft } from '../types/character';
import { serializeCharacter } from './serialization';

/**
 * Sanitizes a character name for use in a filename.
 * Replaces non-alphanumeric characters (except hyphens) with hyphens,
 * collapses consecutive hyphens, and trims leading/trailing hyphens.
 *
 * @example
 * sanitizeFilename("Thorn'ak the Brave") // "Thorn-ak-the-Brave"
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generates a filename for a character export.
 * Format: character-{sanitized-name}-{timestamp}.json
 *
 * @example
 * generateFilename({ name: 'Thorin' }) // "character-Thorin-1708300000000.json"
 */
export function generateFilename(character: CharacterDraft): string {
  const name = character.name ? sanitizeFilename(character.name) : 'unnamed';
  const timestamp = Date.now();
  return `character-${name}-${timestamp}.json`;
}

/**
 * Triggers a browser download of the character data as a JSON file.
 * Creates a Blob from the serialized character, generates a download URL,
 * and programmatically clicks a temporary anchor element.
 */
export function exportCharacterJSON(character: CharacterDraft): void {
  const json = serializeCharacter(character);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const filename = generateFilename(character);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
