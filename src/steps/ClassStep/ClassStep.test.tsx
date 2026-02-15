import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ClassStep } from './ClassStep';

describe('ClassStep', () => {
  it('renders without crashing', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <ClassStep character={mockCharacter} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/select class/i)).toBeInTheDocument();
  });

  it('displays current class selection', () => {
    const mockCharacter = {
      class: {
        name: 'Fighter',
        hitDie: 10 as const,
        primaryAbility: ['STR' as const],
        savingThrows: ['STR', 'CON'] as ['STR', 'CON'],
        armorProficiencies: ['light' as const, 'medium' as const, 'heavy' as const],
        weaponProficiencies: ['simple' as const, 'martial' as const],
        skillChoices: { options: ['Acrobatics', 'Athletics'], count: 2 },
        features: [],
        subclasses: []
      }
    };
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <ClassStep character={mockCharacter} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Fighter/)).toBeInTheDocument();
  });
});
