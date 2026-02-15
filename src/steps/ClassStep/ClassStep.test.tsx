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
      class: { name: 'Fighter', description: '', hitDie: 10, primaryAbility: ['STR'] }
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
