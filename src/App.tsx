import { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import type { CharacterDraft } from './types/character';
import type { Species } from './types/species';
import type { CharacterClass } from './types/class';
import type { Background } from './types/background';
import { BottomNavigation } from './components/BottomNavigation';
import { ExpansionPackToggle } from './components/ExpansionPackToggle';
import { STEPS } from './steps';
import { MYTHIC_REALMS_PACK } from './data/expansion-packs/mythic-realms';
import { RAGNAROK_ONLINE_PACK } from './data/expansion-packs/ragnarok-online';
import type { ExpansionPack } from './types/expansion-pack';

const EXPANSION_PACKS: ExpansionPack[] = [MYTHIC_REALMS_PACK, RAGNAROK_ONLINE_PACK];
import { computeAvailableContent, findStaleSelections } from './rules/expansion-packs';
import speciesData from './data/races.json';
import classesData from './data/classes.json';
import backgroundsData from './data/backgrounds.json';

const BASE_CONTENT = {
  species: speciesData as Species[],
  classes: classesData as unknown as CharacterClass[],
  backgrounds: backgroundsData as unknown as Background[],
};

/** Steps shown in the breadcrumb navigation (excludes Start page). */
const WIZARD_STEPS = STEPS.filter(step => step.path !== '/start');

function Navigation() {
  const location = useLocation();

  // Don't show breadcrumb on the start page
  if (location.pathname === '/start') return null;

  const currentIndex = WIZARD_STEPS.findIndex(step => step.path === location.pathname);

  return (
    <nav className="bg-gray-100 border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <ol className="flex items-center justify-between">
          {WIZARD_STEPS.map((step, index) => {
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

type WizardContentProps = {
  enabledPackIds: string[];
  onEnablePackIds: (ids: string[]) => void;
};

function WizardContent({ enabledPackIds, onEnablePackIds }: WizardContentProps) {
  const [character, setCharacter] = useState<CharacterDraft>({});

  const updateCharacter = (updates: Partial<CharacterDraft>) => {
    setCharacter(prev => ({ ...prev, ...updates }));
  };

  const replaceCharacter = (draft: CharacterDraft) => {
    setCharacter(draft);
  };

  const availableContent = useMemo(
    () => computeAvailableContent(enabledPackIds, EXPANSION_PACKS, BASE_CONTENT),
    [enabledPackIds]
  );

  // Clear character selections that are no longer in available content
  // (e.g. when an expansion pack is toggled off).
  useEffect(() => {
    setCharacter(prev => {
      const stale = findStaleSelections(prev, availableContent);
      if (Object.keys(stale).length === 0) return prev;
      return { ...prev, ...stale };
    });
  }, [availableContent]);

  return (
    <>
      <Navigation />
      <main className="max-w-4xl mx-auto pb-24">
        <Routes>
          <Route path="/" element={<Navigate to="/start" replace />} />
          {STEPS.map(({ path, component: Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <Component
                  character={character}
                  updateCharacter={updateCharacter}
                  replaceCharacter={replaceCharacter}
                  availableContent={availableContent}
                  enabledPackIds={enabledPackIds}
                  onEnablePackIds={onEnablePackIds}
                />
              }
            />
          ))}
        </Routes>
      </main>
      <BottomNavigation character={character} enabledPackIds={enabledPackIds} />
    </>
  );
}

function App() {
  const [enabledPackIds, setEnabledPackIds] = useState<string[]>([]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <header className="bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">D&D 5e Character Creator</h1>
            <ExpansionPackToggle
              packs={EXPANSION_PACKS}
              enabledPackIds={enabledPackIds}
              onChange={setEnabledPackIds}
            />
          </div>
        </header>
        <WizardContent enabledPackIds={enabledPackIds} onEnablePackIds={setEnabledPackIds} />
      </div>
    </BrowserRouter>
  );
}

export default App;
