import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SpeciesStep } from './SpeciesStep';

describe('SpeciesStep', () => {
  it('renders without crashing', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/select species/i)).toBeInTheDocument();
  });

  it('displays current species selection', () => {
    const mockCharacter = {
      species: {
        name: 'Human',
        size: 'Medium' as const,
        speed: 30,
        traits: [],
        languages: ['Common'],
        subspecies: []
      }
    };
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <SpeciesStep character={mockCharacter} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Human/)).toBeInTheDocument();
  });
});
