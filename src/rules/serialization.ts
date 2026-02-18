import type { CharacterDraft } from '../types/character';

/**
 * Current version of the character export format.
 * Increment when the CharacterDraft schema changes.
 */
export const EXPORT_VERSION = 1;

/**
 * Wrapper type for exported character data.
 * Includes a version field for future migration support.
 */
export type CharacterExport = {
  version: number;
  character: CharacterDraft;
};

/**
 * Serializes a CharacterDraft to a JSON string suitable for export.
 * Wraps the character data with a version field for future compatibility.
 *
 * @example
 * const json = serializeCharacter({ name: 'Thorin' });
 * // '{"version":1,"character":{"name":"Thorin"}}'
 */
export function serializeCharacter(character: CharacterDraft): string {
  const exportData: CharacterExport = {
    version: EXPORT_VERSION,
    character,
  };
  return JSON.stringify(exportData, null, 2);
}

/**
 * Result of attempting to deserialize character data.
 * On success, contains the parsed CharacterDraft.
 * On failure, contains an error message describing the issue.
 */
export type DeserializeResult =
  | { success: true; character: CharacterDraft }
  | { success: false; error: string };

/**
 * Deserializes a JSON string into a CharacterDraft.
 * Validates the structure and version compatibility.
 *
 * @example
 * const result = deserializeCharacter('{"version":1,"character":{"name":"Thorin"}}');
 * if (result.success) {
 *   console.log(result.character.name); // 'Thorin'
 * }
 */
export function deserializeCharacter(json: string): DeserializeResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { success: false, error: 'Invalid JSON format.' };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { success: false, error: 'Expected a JSON object.' };
  }

  const obj = parsed as Record<string, unknown>;

  if (typeof obj.version !== 'number') {
    return { success: false, error: 'Missing or invalid version field.' };
  }

  if (obj.version > EXPORT_VERSION) {
    return {
      success: false,
      error: `Unsupported version ${obj.version}. This app supports version ${EXPORT_VERSION} or earlier.`,
    };
  }

  if (typeof obj.character !== 'object' || obj.character === null || Array.isArray(obj.character)) {
    return { success: false, error: 'Missing or invalid character field.' };
  }

  const character = obj.character as CharacterDraft;

  // Validate key fields have correct types when present
  if (character.name !== undefined && typeof character.name !== 'string') {
    return { success: false, error: 'Character name must be a string.' };
  }

  if (character.level !== undefined && typeof character.level !== 'number') {
    return { success: false, error: 'Character level must be a number.' };
  }

  return { success: true, character };
}
