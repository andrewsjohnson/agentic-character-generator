import type { StepProps } from '../types';

export function CharacterNameStep({ character, updateCharacter }: StepProps) {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Name Your Character</h2>
      <p className="text-gray-600 mb-6">
        Choose a name for your character. You can change this later.
      </p>

      <div className="max-w-md">
        <label
          htmlFor="character-name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Character Name
        </label>
        <input
          id="character-name"
          type="text"
          value={character.name ?? ''}
          onChange={(e) => updateCharacter({ name: e.target.value })}
          placeholder="Enter character name"
          maxLength={50}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
}
