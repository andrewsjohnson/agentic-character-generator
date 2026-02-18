import { StartStep } from './steps/StartStep/StartStep';
import { CharacterNameStep } from './steps/CharacterNameStep/CharacterNameStep';
import { SpeciesStep } from './steps/SpeciesStep/SpeciesStep';
import { ClassStep } from './steps/ClassStep/ClassStep';
import { AbilityScoreStep } from './steps/AbilityScoreStep/AbilityScoreStep';
import { BackgroundStep } from './steps/BackgroundStep/BackgroundStep';
import { EquipmentStep } from './steps/EquipmentStep/EquipmentStep';
import { ReviewStep } from './steps/ReviewStep/ReviewStep';

export const STEPS = [
  { path: '/start', label: 'Start', component: StartStep },
  { path: '/name', label: 'Name', component: CharacterNameStep },
  { path: '/species', label: 'Species', component: SpeciesStep },
  { path: '/class', label: 'Class', component: ClassStep },
  { path: '/ability-scores', label: 'Ability Scores', component: AbilityScoreStep },
  { path: '/background', label: 'Background', component: BackgroundStep },
  { path: '/equipment', label: 'Equipment', component: EquipmentStep },
  { path: '/review', label: 'Review', component: ReviewStep },
] as const;
