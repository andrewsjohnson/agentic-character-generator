import type { CharacterDraft } from '../types/character';

/**
 * Current version of the character export format.
 * Increment when the CharacterDraft schema changes.
 *
 * v1: Initial format (character only)
 * v2: Added enabledPackIds for expansion pack support
 */
export const EXPORT_VERSION = 2;

/**
 * Wrapper type for exported character data.
 * Includes a version field for future migration support.
 */
export type CharacterExport = {
  version: number;
  character: CharacterDraft;
  enabledPackIds?: string[];
};

/**
 * Serializes a CharacterDraft to a JSON string suitable for export.
 * Wraps the character data with a version field for future compatibility.
 * Optionally includes enabled expansion pack IDs.
 */
export function serializeCharacter(
  character: CharacterDraft,
  enabledPackIds?: string[],
): string {
  const exportData: CharacterExport = {
    version: EXPORT_VERSION,
    character,
  };
  if (enabledPackIds && enabledPackIds.length > 0) {
    exportData.enabledPackIds = enabledPackIds;
  }
  return JSON.stringify(exportData, null, 2);
}

/**
 * Result of attempting to deserialize character data.
 * On success, contains the parsed CharacterDraft and any enabled pack IDs.
 * On failure, contains an error message describing the issue.
 */
export type DeserializeResult =
  | { success: true; character: CharacterDraft; enabledPackIds: string[] }
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

  // Work with character as a raw record for runtime validation before casting
  const charRaw = obj.character as Record<string, unknown>;

  if (charRaw.name !== undefined && typeof charRaw.name !== 'string') {
    return { success: false, error: 'Character name must be a string.' };
  }

  if (charRaw.level !== undefined && typeof charRaw.level !== 'number') {
    return { success: false, error: 'Character level must be a number.' };
  }

  // species, class, background must be non-null objects (not arrays) if present
  for (const field of ['species', 'class', 'background'] as const) {
    const val = charRaw[field];
    if (val !== undefined && (typeof val !== 'object' || val === null || Array.isArray(val))) {
      return { success: false, error: `Character ${field} must be an object.` };
    }
  }

  // baseAbilityScores must be a non-null object with all numeric values if present
  if (charRaw.baseAbilityScores !== undefined) {
    const bas = charRaw.baseAbilityScores;
    if (typeof bas !== 'object' || bas === null || Array.isArray(bas)) {
      return { success: false, error: 'Character baseAbilityScores must be an object with numeric values.' };
    }
    const hasNonNumericValue = Object.values(bas as Record<string, unknown>).some(v => typeof v !== 'number');
    if (hasNonNumericValue) {
      return { success: false, error: 'Character baseAbilityScores must be an object with numeric values.' };
    }
  }

  const character = charRaw as unknown as CharacterDraft;

  // Parse enabledPackIds (added in v2, defaults to [] for v1 imports)
  let enabledPackIds: string[] = [];
  if (obj.enabledPackIds !== undefined) {
    if (!Array.isArray(obj.enabledPackIds)) {
      return { success: false, error: 'enabledPackIds must be an array.' };
    }
    const allStrings = (obj.enabledPackIds as unknown[]).every(
      (id) => typeof id === 'string',
    );
    if (!allStrings) {
      return { success: false, error: 'enabledPackIds must contain only strings.' };
    }
    enabledPackIds = obj.enabledPackIds as string[];
  }

  return { success: true, character, enabledPackIds };
}
