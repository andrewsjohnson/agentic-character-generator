import type { CharacterDraft } from '../../types/character';

export type StepProps = {
  character: CharacterDraft;
  updateCharacter: (updates: Partial<CharacterDraft>) => void;
};

export function AbilityScoreStep({ character, updateCharacter }: StepProps) {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Assign Ability Scores</h2>
      <p className="text-gray-600">
        Choose a method and assign your ability scores. This step will be implemented with point buy, standard array, or manual entry options.
      </p>
      <div className="mt-4 text-sm text-gray-500">
        Method: {character.abilityScoreMethod || 'Not selected'}
      </div>
    </div>
  );
}
