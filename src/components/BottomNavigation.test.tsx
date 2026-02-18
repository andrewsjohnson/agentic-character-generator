import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import type { CharacterDraft } from '../types/character';
import type { Species } from '../types/species';
import type { CharacterClass } from '../types/class';
import type { Background } from '../types/background';
import speciesData from '../data/races.json';
import classesData from '../data/classes.json';
import backgroundsData from '../data/backgrounds.json';

const species = speciesData as unknown as Species[];
const classes = classesData as unknown as CharacterClass[];
const backgrounds = backgroundsData as unknown as Background[];

const human = species.find(s => s.name === 'Human')!;
const dwarf = species.find(s => s.name === 'Dwarf')!;
const fighter = classes.find(c => c.name === 'Fighter')!;
const acolyte = backgrounds.find(b => b.name === 'Acolyte')!;

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../rules/json-export', () => ({
  exportCharacterJSON: vi.fn(),
}));

vi.mock('../rules/pdf-export', () => ({
  exportCharacterPDF: vi.fn(),
}));

function renderOnStep(path: string, character: CharacterDraft = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <BottomNavigation character={character} />
    </MemoryRouter>
  );
}

describe('BottomNavigation', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('start page', () => {
    it('does not render on the /start page', () => {
      const { container } = renderOnStep('/start');
      expect(container.querySelector('nav')).not.toBeInTheDocument();
    });
  });

  describe('button states', () => {
    it('enables Back button on /name (navigates back to /start)', () => {
      renderOnStep('/name');
      const backButton = screen.getByRole('button', { name: /previous step/i });
      expect(backButton).not.toBeDisabled();
    });

    it('enables Back button on steps after the first', () => {
      renderOnStep('/species');
      const backButton = screen.getByRole('button', { name: /previous step/i });
      expect(backButton).not.toBeDisabled();
    });

    it('disables Next button on the last step (/review)', () => {
      renderOnStep('/review');
      const nextButton = screen.getByRole('button', { name: /next step/i });
      expect(nextButton).toBeDisabled();
    });

    it('enables Next button on steps before the last when no validation applies', () => {
      renderOnStep('/name');
      const nextButton = screen.getByRole('button', { name: /next step/i });
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('navigation', () => {
    it('navigates to the previous step when Back is clicked', () => {
      renderOnStep('/species');
      const backButton = screen.getByRole('button', { name: /previous step/i });
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith('/name');
    });

    it('navigates from /name back to /start when Back is clicked', () => {
      renderOnStep('/name');
      const backButton = screen.getByRole('button', { name: /previous step/i });
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith('/start');
    });

    it('navigates to the next step when Next is clicked and validation passes', () => {
      const character: CharacterDraft = { species: human };
      renderOnStep('/species', character);
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).toHaveBeenCalledWith('/class');
    });

    it('does not navigate when Next is clicked and validation fails', () => {
      renderOnStep('/species');
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('clears errors when Back is clicked', () => {
      renderOnStep('/species');
      // Click Next to trigger validation errors
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Click Back to clear errors
      const backButton = screen.getByRole('button', { name: /previous step/i });
      fireEvent.click(backButton);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('clears errors when navigating to a different step via pathname change', () => {
      // Render with a link to simulate top breadcrumb navigation
      // BottomNavigation persists across route changes, so useEffect detects pathname change
      render(
        <MemoryRouter initialEntries={['/species']}>
          <Routes>
            <Route path="*" element={
              <>
                <Link to="/background">Go to Background</Link>
                <BottomNavigation character={{}} />
              </>
            } />
          </Routes>
        </MemoryRouter>
      );

      // Click Next to trigger validation errors
      fireEvent.click(screen.getByRole('button', { name: /next step/i }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Simulate navigating via top breadcrumb by clicking a link
      fireEvent.click(screen.getByText('Go to Background'));

      // Errors from species step should be cleared by useEffect
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('validation per step', () => {
    it('allows proceeding from /name with empty character', () => {
      renderOnStep('/name');
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).toHaveBeenCalledWith('/species');
    });

    it('blocks proceeding from /species when no species is selected', () => {
      renderOnStep('/species');
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('allows proceeding from /species when species is selected', () => {
      renderOnStep('/species', { species: human });
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).toHaveBeenCalledWith('/class');
    });

    it('blocks proceeding from /species when species has subspecies but none selected', () => {
      renderOnStep('/species', { species: dwarf });
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('allows proceeding from /species when species and subspecies are selected', () => {
      renderOnStep('/species', { species: dwarf, subspecies: dwarf.subspecies[0] });
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).toHaveBeenCalledWith('/class');
    });

    it('blocks proceeding from /class when no class is selected', () => {
      renderOnStep('/class');
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('allows proceeding from /class when class is selected', () => {
      renderOnStep('/class', { class: fighter });
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).toHaveBeenCalledWith('/ability-scores');
    });

    it('blocks proceeding from /ability-scores when no method is selected', () => {
      renderOnStep('/ability-scores');
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('allows proceeding from /ability-scores with valid standard array', () => {
      const character: CharacterDraft = {
        abilityScoreMethod: 'standard-array',
        baseAbilityScores: { STR: 15, DEX: 14, CON: 13, INT: 12, WIS: 10, CHA: 8 },
      };
      renderOnStep('/ability-scores', character);
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).toHaveBeenCalledWith('/background');
    });

    it('blocks proceeding from /background when no background is selected', () => {
      renderOnStep('/background');
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('allows proceeding from /background when background is selected', () => {
      renderOnStep('/background', { background: acolyte });
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).toHaveBeenCalledWith('/equipment');
    });

    it('blocks proceeding from /equipment when class is selected but no equipment chosen', () => {
      renderOnStep('/equipment', { class: fighter });
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('allows proceeding from /equipment when equipment is selected', () => {
      const character: CharacterDraft = {
        class: fighter,
        equipment: [{ kind: 'weapon', name: 'Longsword', category: 'martial', damage: '1d8', damageType: 'slashing', properties: ['versatile'], weight: 3, cost: '15 gp' }],
      };
      renderOnStep('/equipment', character);
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(mockNavigate).toHaveBeenCalledWith('/review');
    });
  });

  describe('validation error display', () => {
    it('shows validation errors when Next is clicked and validation fails', () => {
      renderOnStep('/species');
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(screen.getByText('Species must be selected.')).toBeInTheDocument();
    });

    it('shows subspecies error when species has subspecies but none selected', () => {
      renderOnStep('/species', { species: dwarf });
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(screen.getByText('Subspecies must be selected for this species.')).toBeInTheDocument();
    });

    it('shows multiple errors from ability scores step', () => {
      renderOnStep('/ability-scores');
      const nextButton = screen.getByRole('button', { name: /next step/i });
      fireEvent.click(nextButton);
      expect(screen.getByText('Ability score method must be selected.')).toBeInTheDocument();
      expect(screen.getByText('Ability scores must be assigned.')).toBeInTheDocument();
    });

    it('does not show errors before Next is clicked', () => {
      renderOnStep('/species');
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('clears errors when validation passes after user fixes issues', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/species']}>
          <BottomNavigation character={{}} />
        </MemoryRouter>
      );

      // Click Next to trigger errors
      fireEvent.click(screen.getByRole('button', { name: /next step/i }));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Re-render with valid character and click Next
      rerender(
        <MemoryRouter initialEntries={['/species']}>
          <BottomNavigation character={{ species: human }} />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByRole('button', { name: /next step/i }));
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('export buttons', () => {
    it('shows export buttons on /review step', () => {
      renderOnStep('/review');
      expect(screen.getByRole('button', { name: /download character as pdf/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download character as json/i })).toBeInTheDocument();
    });

    it('does not show export buttons on non-review steps', () => {
      renderOnStep('/name');
      expect(screen.queryByRole('button', { name: /download character as pdf/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /download character as json/i })).not.toBeInTheDocument();
    });

    it('calls exportCharacterPDF when Download PDF is clicked', async () => {
      const { exportCharacterPDF } = await import('../rules/pdf-export');
      renderOnStep('/review');
      fireEvent.click(screen.getByRole('button', { name: /download character as pdf/i }));
      expect(exportCharacterPDF).toHaveBeenCalled();
    });

    it('calls exportCharacterJSON when Download JSON is clicked', async () => {
      const { exportCharacterJSON } = await import('../rules/json-export');
      renderOnStep('/review');
      fireEvent.click(screen.getByRole('button', { name: /download character as json/i }));
      expect(exportCharacterJSON).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has proper aria-label on navigation', () => {
      renderOnStep('/name');
      expect(screen.getByRole('navigation', { name: /step navigation/i })).toBeInTheDocument();
    });

    it('error messages use role="alert" with aria-live="assertive"', () => {
      renderOnStep('/species');
      fireEvent.click(screen.getByRole('button', { name: /next step/i }));
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });

    it('buttons have accessible aria-labels', () => {
      renderOnStep('/species');
      expect(screen.getByRole('button', { name: /previous step/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next step/i })).toBeInTheDocument();
    });

    it('Next button has aria-disabled when validation fails', () => {
      renderOnStep('/species');
      const nextButton = screen.getByRole('button', { name: /next step/i });
      expect(nextButton).toHaveAttribute('aria-disabled', 'true');
    });

    it('Next button does not have aria-disabled when validation passes', () => {
      renderOnStep('/species', { species: human });
      const nextButton = screen.getByRole('button', { name: /next step/i });
      expect(nextButton).toHaveAttribute('aria-disabled', 'false');
    });

    it('export buttons have accessible aria-labels', () => {
      renderOnStep('/review');
      expect(screen.getByRole('button', { name: /download character as pdf/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download character as json/i })).toBeInTheDocument();
    });
  });

  describe('rendering', () => {
    it('renders Back and Next buttons', () => {
      renderOnStep('/name');
      expect(screen.getByText('Back')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('does not render when on an unknown path', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/unknown']}>
          <BottomNavigation character={{}} />
        </MemoryRouter>
      );
      expect(container.querySelector('nav')).not.toBeInTheDocument();
    });
  });
});
