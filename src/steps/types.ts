import type { CharacterDraft } from '../types/character';

export type StepProps = {
  character: CharacterDraft;
  updateCharacter: (updates: Partial<CharacterDraft>) => void;
};
