import { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { CharacterDraft } from '../types/character';
import type { ValidationResult } from '../rules/validation';
import {
  validateSpeciesStep,
  validateClassStep,
  validateAbilityScoresStep,
  validateBackgroundStep,
  validateEquipmentStep,
} from '../rules/validation';
import { exportCharacterJSON } from '../rules/json-export';
import { exportCharacterPDF } from '../rules/pdf-export';
import { STEPS } from '../steps';
import { capture } from '../analytics/index';

type StepPath = (typeof STEPS)[number]['path'];

const STEP_VALIDATION: Record<StepPath, ((character: CharacterDraft) => ValidationResult) | null> = {
  '/start': null,
  '/name': null,
  '/species': validateSpeciesStep,
  '/class': validateClassStep,
  '/ability-scores': validateAbilityScoresStep,
  '/background': validateBackgroundStep,
  '/equipment': validateEquipmentStep,
  '/review': null,
};

type BottomNavigationProps = {
  character: CharacterDraft;
  enabledPackIds?: string[];
};

export function BottomNavigation({ character, enabledPackIds }: BottomNavigationProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setErrors([]);
  }, [location.pathname]);

  const currentIndex = STEPS.findIndex(step => step.path === location.pathname);

  const currentPath = currentIndex >= 0 ? (STEPS[currentIndex].path as StepPath) : null;
  const validateFn = currentPath ? STEP_VALIDATION[currentPath] : null;

  const validation = useMemo<ValidationResult | null>(() => {
    if (!validateFn) return null;
    return validateFn(character);
  }, [validateFn, character]);

  // Don't render if we're not on a known step or on the start page
  if (currentIndex === -1) return null;
  if (location.pathname === '/start') return null;

  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === STEPS.length - 1;
  const isReviewStep = location.pathname === '/review';

  const previousPath = isFirstStep ? null : STEPS[currentIndex - 1].path;
  const nextPath = isLastStep ? null : STEPS[currentIndex + 1].path;

  const isNextDisabled = isLastStep || (validation !== null && !validation.valid);

  const handleBack = () => {
    if (previousPath) {
      setErrors([]);
      navigate(previousPath);
    }
  };

  const handleNext = () => {
    if (isLastStep) return;

    if (validation && !validation.valid) {
      setErrors(validation.errors);
      capture('step_validation_failed', {
        step: currentPath ?? '',
        errors: validation.errors,
      });
      return;
    }

    setErrors([]);
    if (nextPath) {
      capture('step_completed', {
        from_step: currentPath ?? '',
        to_step: nextPath,
        step_index: currentIndex,
      });
      navigate(nextPath);
    }
  };

  const handleExportPDF = () => {
    capture('character_exported', { format: 'pdf' });
    exportCharacterPDF(character);
  };

  const handleExportJSON = () => {
    capture('character_exported', { format: 'json' });
    exportCharacterJSON(character, enabledPackIds);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
      aria-label="Step navigation"
    >
      {errors.length > 0 && (
        <div
          className="max-w-4xl mx-auto px-4 pt-3"
          role="alert"
          aria-live="assertive"
        >
          <ul className="text-sm text-red-600 space-y-1">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <button
          type="button"
          onClick={handleBack}
          disabled={isFirstStep}
          aria-label="Go to previous step"
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            isFirstStep
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Back
        </button>
        <div className="flex gap-2">
          {isReviewStep && (
            <>
              <button
                type="button"
                onClick={handleExportPDF}
                aria-label="Download character as PDF"
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
              >
                Download PDF
              </button>
              <button
                type="button"
                onClick={handleExportJSON}
                aria-label="Download character as JSON"
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Download JSON
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={isLastStep}
            aria-disabled={isNextDisabled}
            aria-label="Go to next step"
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              isLastStep
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isNextDisabled
                ? 'bg-blue-300 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </nav>
  );
}
