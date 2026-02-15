import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BackgroundStep } from './BackgroundStep';

describe('BackgroundStep', () => {
  it('renders without crashing', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/select background/i)).toBeInTheDocument();
  });

  it('displays current background selection', () => {
    const mockCharacter = {
      background: { name: 'Acolyte', description: '', skillProficiencies: [] }
    };
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <BackgroundStep character={mockCharacter} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Acolyte/)).toBeInTheDocument();
  });
});
