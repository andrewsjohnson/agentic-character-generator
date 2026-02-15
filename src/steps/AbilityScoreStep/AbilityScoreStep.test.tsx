import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AbilityScoreStep } from './AbilityScoreStep';

describe('AbilityScoreStep', () => {
  it('renders without crashing', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/assign ability scores/i)).toBeInTheDocument();
  });

  it('displays current ability score method', () => {
    const mockCharacter = {
      abilityScoreMethod: 'point-buy' as const
    };
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <AbilityScoreStep character={mockCharacter} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/point-buy/)).toBeInTheDocument();
  });
});
