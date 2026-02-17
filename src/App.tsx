import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import type { CharacterDraft } from './types/character';
import { CharacterNameStep } from './steps/CharacterNameStep/CharacterNameStep';
import { SpeciesStep } from './steps/SpeciesStep/SpeciesStep';
import { ClassStep } from './steps/ClassStep/ClassStep';
import { AbilityScoreStep } from './steps/AbilityScoreStep/AbilityScoreStep';
import { BackgroundStep } from './steps/BackgroundStep/BackgroundStep';
import { EquipmentStep } from './steps/EquipmentStep/EquipmentStep';
import { ReviewStep } from './steps/ReviewStep/ReviewStep';

const STEPS = [
  { path: '/name', label: 'Name', component: CharacterNameStep },
  { path: '/species', label: 'Species', component: SpeciesStep },
  { path: '/class', label: 'Class', component: ClassStep },
  { path: '/ability-scores', label: 'Ability Scores', component: AbilityScoreStep },
  { path: '/background', label: 'Background', component: BackgroundStep },
  { path: '/equipment', label: 'Equipment', component: EquipmentStep },
  { path: '/review', label: 'Review', component: ReviewStep },
];

function Navigation() {
  const location = useLocation();
  const currentIndex = STEPS.findIndex(step => step.path === location.pathname);

  return (
    <nav className="bg-gray-100 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isActive = location.pathname === step.path;
            const isCompleted = index < currentIndex;

            return (
              <li key={step.path} className="flex items-center">
                <Link
                  to={step.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {step.label}
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

function WizardContent() {
  const [character, setCharacter] = useState<CharacterDraft>({});

  const updateCharacter = (updates: Partial<CharacterDraft>) => {
    setCharacter(prev => ({ ...prev, ...updates }));
  };

  return (
    <>
      <Navigation />
      <main className="max-w-4xl mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/name" replace />} />
          {STEPS.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={<Component character={character} updateCharacter={updateCharacter} />}
            />
          ))}
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <header className="bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">D&D 5e Character Creator</h1>
          </div>
        </header>
        <WizardContent />
      </div>
    </BrowserRouter>
  );
}

export default App;
