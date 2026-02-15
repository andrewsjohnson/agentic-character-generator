import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EquipmentStep } from './EquipmentStep';

describe('EquipmentStep', () => {
  it('renders without crashing', () => {
    const mockCharacter = {};
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <EquipmentStep character={mockCharacter} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/choose equipment/i)).toBeInTheDocument();
  });

  it('displays equipment count', () => {
    const mockCharacter = {
      equipment: [
        { name: 'Longsword', type: 'weapon' },
        { name: 'Shield', type: 'armor' }
      ]
    };
    const mockUpdate = vi.fn();

    render(
      <MemoryRouter>
        <EquipmentStep character={mockCharacter} updateCharacter={mockUpdate} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Items selected: 2/)).toBeInTheDocument();
  });
});
