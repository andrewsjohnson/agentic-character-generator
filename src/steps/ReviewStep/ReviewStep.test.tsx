import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ReviewStep } from './ReviewStep';

describe('ReviewStep', () => {
  it('renders without crashing', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <ReviewStep character={mockCharacter} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/review character/i)).toBeInTheDocument();
  });

  it('displays character details', () => {
    const mockCharacter = {
      species: {
        name: 'Elf',
        size: 'Medium' as const,
        speed: 30,
        traits: [],
        languages: ['Common', 'Elvish'],
        subspecies: []
      },
      class: {
        name: 'Wizard',
        hitDie: 6 as const,
        primaryAbility: ['INT' as const],
        savingThrows: ['INT', 'WIS'] as ['INT', 'WIS'],
        armorProficiencies: [],
        weaponProficiencies: [],
        skillChoices: { options: [], count: 2 },
        features: [],
        subclasses: []
      },
      background: {
        name: 'Sage',
        abilityOptions: ['INT', 'WIS', 'CHA'] as ['INT', 'WIS', 'CHA'],
        skillProficiencies: ['Arcana', 'History'] as ['Arcana', 'History'],
        toolProficiency: 'None',
        equipment: [],
        feature: { name: 'Researcher', description: '' },
        originFeat: 'Magic Initiate',
        personalityTraits: [],
        ideals: [],
        bonds: [],
        flaws: []
      },
      abilityScoreMethod: 'standard-array' as const
    };
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <ReviewStep character={mockCharacter} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Elf/)).toBeInTheDocument();
    expect(screen.getByText(/Wizard/)).toBeInTheDocument();
    expect(screen.getByText(/Sage/)).toBeInTheDocument();
    expect(screen.getByText(/standard-array/)).toBeInTheDocument();
  });
});
