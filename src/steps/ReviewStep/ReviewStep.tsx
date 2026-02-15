import type { CharacterDraft } from '../../types/character';

export type StepProps = {
  character: CharacterDraft;
  updateCharacter: (updates: Partial<CharacterDraft>) => void;
};

export function ReviewStep({ character, updateCharacter }: StepProps) {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Review Character</h2>
      <p className="text-gray-600 mb-6">
        Review your character details before finalizing.
      </p>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Species</h3>
          <p className="text-gray-600">{character.species?.name || 'Not selected'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Class</h3>
          <p className="text-gray-600">{character.class?.name || 'Not selected'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Background</h3>
          <p className="text-gray-600">{character.background?.name || 'Not selected'}</p>
        </div>

        <div>
          <h3 className="font-semibold">Ability Scores</h3>
          <p className="text-gray-600">
            Method: {character.abilityScoreMethod || 'Not selected'}
          </p>
        </div>
      </div>
    </div>
  );
}
