import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import type { CharacterDraft } from './types/character';
import { BottomNavigation } from './components/BottomNavigation';
import { STEPS } from './steps';

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
      <main className="max-w-4xl mx-auto pb-24">
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
      <BottomNavigation character={character} />
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
