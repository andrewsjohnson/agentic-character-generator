import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CharacterNameStep } from './CharacterNameStep';

describe('CharacterNameStep', () => {
  it('renders the character name input', () => {
    render(
      <MemoryRouter>
        <CharacterNameStep character={{}} updateCharacter={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/character name/i)).toBeInTheDocument();
    expect(screen.getByText(/name your character/i)).toBeInTheDocument();
  });

  it('displays current name from character state', () => {
    render(
      <MemoryRouter>
        <CharacterNameStep
          character={{ name: 'Gandalf' }}
          updateCharacter={vi.fn()}
        />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/character name/i) as HTMLInputElement;
    expect(input.value).toBe('Gandalf');
  });

  it('updates character state when name is entered', () => {
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <CharacterNameStep character={{}} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/character name/i);
    fireEvent.change(input, { target: { value: 'Aragorn' } });

    expect(mockUpdate).toHaveBeenCalledWith({ name: 'Aragorn' });
  });

  it('shows empty input when character has no name', () => {
    render(
      <MemoryRouter>
        <CharacterNameStep character={{}} updateCharacter={vi.fn()} />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/character name/i) as HTMLInputElement;
    expect(input.value).toBe('');
  });
});
