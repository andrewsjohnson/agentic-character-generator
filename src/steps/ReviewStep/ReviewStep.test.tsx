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
      species: { name: 'Elf', description: '', size: 'Medium', speed: 30 },
      class: { name: 'Wizard', description: '', hitDie: 6, primaryAbility: ['INT'] },
      background: { name: 'Sage', description: '', skillProficiencies: [] },
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
