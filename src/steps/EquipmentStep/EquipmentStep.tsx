import type { CharacterDraft } from '../../types/character';

export type StepProps = {
  character: CharacterDraft;
  updateCharacter: (updates: Partial<CharacterDraft>) => void;
};

export function EquipmentStep({ character }: StepProps) {
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Choose Equipment</h2>
      <p className="text-gray-600">
        Select your starting equipment. This step will be implemented with equipment options based on class and background.
      </p>
      <div className="mt-4 text-sm text-gray-500">
        Items selected: {character.equipment?.length || 0}
      </div>
    </div>
  );
}
