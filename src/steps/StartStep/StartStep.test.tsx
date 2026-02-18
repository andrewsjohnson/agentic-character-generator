import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { StartStep } from './StartStep';
import type { CharacterDraft } from '../../types/character';
import type { AvailableContent } from '../../types/expansion-pack';
import { EXPORT_VERSION } from '../../rules/serialization';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const emptyContent: AvailableContent = {
  species: [{ source: 'Base Content', items: [] }],
  classes: [{ source: 'Base Content', items: [] }],
  backgrounds: [{ source: 'Base Content', items: [] }],
};

function renderStartStep(
  updateCharacter = vi.fn(),
  onEnablePackIds = vi.fn(),
) {
  const character: CharacterDraft = {};
  return {
    updateCharacter,
    onEnablePackIds,
    ...render(
      <MemoryRouter initialEntries={['/start']}>
        <StartStep
          character={character}
          updateCharacter={updateCharacter}
          availableContent={emptyContent}
          onEnablePackIds={onEnablePackIds}
        />
      </MemoryRouter>
    ),
  };
}

function createFile(content: string, name = 'character.json', type = 'application/json'): File {
  return new File([content], name, { type });
}

describe('StartStep', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders welcome message and buttons', () => {
    renderStartStep();
    expect(screen.getByText('Welcome to D&D 5e Character Creator')).toBeInTheDocument();
    expect(screen.getByText('Create New Character')).toBeInTheDocument();
    expect(screen.getByText('Import Character')).toBeInTheDocument();
  });

  it('navigates to /name when Create New Character is clicked', () => {
    renderStartStep();
    fireEvent.click(screen.getByText('Create New Character'));
    expect(mockNavigate).toHaveBeenCalledWith('/name');
  });

  it('has a file input that accepts .json files', () => {
    renderStartStep();
    const fileInput = screen.getByLabelText('Choose character file');
    expect(fileInput).toHaveAttribute('accept', '.json');
  });

  it('calls updateCharacter and navigates to /review on valid import', async () => {
    const updateCharacter = vi.fn();
    renderStartStep(updateCharacter);

    const validJson = JSON.stringify({
      version: EXPORT_VERSION,
      character: { name: 'Imported Hero' },
    });

    const file = createFile(validJson);
    const fileInput = screen.getByLabelText('Choose character file');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(updateCharacter).toHaveBeenCalledWith({ name: 'Imported Hero' });
      expect(mockNavigate).toHaveBeenCalledWith('/review');
    });
  });

  it('calls onEnablePackIds with imported pack IDs', async () => {
    const updateCharacter = vi.fn();
    const onEnablePackIds = vi.fn();
    renderStartStep(updateCharacter, onEnablePackIds);

    const validJson = JSON.stringify({
      version: EXPORT_VERSION,
      character: { name: 'Pack Hero' },
      enabledPackIds: ['mythic-realms'],
    });

    const file = createFile(validJson);
    const fileInput = screen.getByLabelText('Choose character file');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onEnablePackIds).toHaveBeenCalledWith(['mythic-realms']);
      expect(updateCharacter).toHaveBeenCalledWith({ name: 'Pack Hero' });
      expect(mockNavigate).toHaveBeenCalledWith('/review');
    });
  });

  it('does not call onEnablePackIds when no pack IDs in import', async () => {
    const updateCharacter = vi.fn();
    const onEnablePackIds = vi.fn();
    renderStartStep(updateCharacter, onEnablePackIds);

    const validJson = JSON.stringify({
      version: EXPORT_VERSION,
      character: { name: 'No Packs' },
    });

    const file = createFile(validJson);
    const fileInput = screen.getByLabelText('Choose character file');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onEnablePackIds).not.toHaveBeenCalled();
      expect(updateCharacter).toHaveBeenCalledWith({ name: 'No Packs' });
    });
  });

  it('shows error for invalid JSON file', async () => {
    renderStartStep();

    const file = createFile('not valid json');
    const fileInput = screen.getByLabelText('Choose character file');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid JSON format.');
    });
  });

  it('shows error for JSON missing version field', async () => {
    renderStartStep();

    const file = createFile('{"character":{}}');
    const fileInput = screen.getByLabelText('Choose character file');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Missing or invalid version field.');
    });
  });

  it('shows error for non-.json file extension', () => {
    renderStartStep();

    const file = createFile('some content', 'notes.txt', 'text/plain');
    const fileInput = screen.getByLabelText('Choose character file');
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(screen.getByRole('alert')).toHaveTextContent('Please select a .json file.');
  });

  it('does not navigate when import fails', async () => {
    renderStartStep();

    const file = createFile('invalid');
    const fileInput = screen.getByLabelText('Choose character file');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
