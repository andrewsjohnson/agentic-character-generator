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
        {
          kind: 'weapon' as const,
          name: 'Longsword',
          category: 'martial' as const,
          damage: '1d8',
          damageType: 'slashing' as const,
          properties: [],
          weight: 3,
          cost: '15 gp'
        },
        {
          kind: 'armor' as const,
          name: 'Shield',
          category: 'shield' as const,
          baseAC: 2,
          addDex: false,
          stealthDisadvantage: false,
          weight: 6,
          cost: '10 gp'
        }
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
