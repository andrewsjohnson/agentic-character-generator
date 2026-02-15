import type { CharacterDraft } from '../../types/character';

export type StepProps = {
  character: CharacterDraft;
  updateCharacter: (updates: Partial<CharacterDraft>) => void;
};

export function BackgroundStep({ character }: StepProps) {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Select Background</h2>
      <p className="text-gray-600">
        Choose your character's background. This step will be implemented with background options from the SRD data.
      </p>
      <div className="mt-4 text-sm text-gray-500">
        Current selection: {character.background?.name || 'None'}
      </div>
    </div>
  );
}
