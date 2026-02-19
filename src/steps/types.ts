import type { CharacterDraft } from '../types/character';
import type { AvailableContent } from '../types/expansion-pack';

export type StepProps = {
  character: CharacterDraft;
  updateCharacter: (updates: Partial<CharacterDraft>) => void;
  replaceCharacter?: (draft: CharacterDraft) => void;
  availableContent: AvailableContent;
  enabledPackIds?: string[];
  onEnablePackIds?: (ids: string[]) => void;
};
