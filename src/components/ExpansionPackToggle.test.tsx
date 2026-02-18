import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpansionPackToggle } from './ExpansionPackToggle';
import type { ExpansionPack } from '../types/expansion-pack';

const mythicRealms: ExpansionPack = {
  id: 'mythic-realms',
  name: 'Mythic Realms',
  description: 'Adds celestial and arcane options.',
  species: [],
  classes: [],
  backgrounds: [],
};

const darkLands: ExpansionPack = {
  id: 'dark-lands',
  name: 'Dark Lands',
  description: 'Adds shadow and undead options.',
  species: [],
  classes: [],
  backgrounds: [],
};

const packs = [mythicRealms, darkLands];

describe('ExpansionPackToggle', () => {
  it('renders the toggle button', () => {
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={[]} onChange={() => {}} />
    );
    expect(screen.getByTestId('expansion-pack-toggle-button')).toBeInTheDocument();
    expect(screen.getByText('Expansion Packs')).toBeInTheDocument();
  });

  it('does not show the dropdown panel initially', () => {
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={[]} onChange={() => {}} />
    );
    expect(screen.queryByTestId('expansion-pack-panel')).not.toBeInTheDocument();
  });

  it('shows the dropdown panel when button is clicked', () => {
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={[]} onChange={() => {}} />
    );
    fireEvent.click(screen.getByTestId('expansion-pack-toggle-button'));
    expect(screen.getByTestId('expansion-pack-panel')).toBeInTheDocument();
  });

  it('closes the dropdown panel when button is clicked again', () => {
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={[]} onChange={() => {}} />
    );
    const button = screen.getByTestId('expansion-pack-toggle-button');
    fireEvent.click(button);
    expect(screen.getByTestId('expansion-pack-panel')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByTestId('expansion-pack-panel')).not.toBeInTheDocument();
  });

  it('displays all packs with names and descriptions', () => {
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={[]} onChange={() => {}} />
    );
    fireEvent.click(screen.getByTestId('expansion-pack-toggle-button'));

    expect(screen.getByText('Mythic Realms')).toBeInTheDocument();
    expect(screen.getByText('Adds celestial and arcane options.')).toBeInTheDocument();
    expect(screen.getByText('Dark Lands')).toBeInTheDocument();
    expect(screen.getByText('Adds shadow and undead options.')).toBeInTheDocument();
  });

  it('shows checkboxes as unchecked when no packs are enabled', () => {
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={[]} onChange={() => {}} />
    );
    fireEvent.click(screen.getByTestId('expansion-pack-toggle-button'));

    const mythicCheckbox = screen.getByTestId('expansion-pack-checkbox-mythic-realms');
    const darkCheckbox = screen.getByTestId('expansion-pack-checkbox-dark-lands');
    expect(mythicCheckbox).not.toBeChecked();
    expect(darkCheckbox).not.toBeChecked();
  });

  it('shows checkboxes as checked for enabled packs', () => {
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={['mythic-realms']} onChange={() => {}} />
    );
    fireEvent.click(screen.getByTestId('expansion-pack-toggle-button'));

    expect(screen.getByTestId('expansion-pack-checkbox-mythic-realms')).toBeChecked();
    expect(screen.getByTestId('expansion-pack-checkbox-dark-lands')).not.toBeChecked();
  });

  it('calls onChange with the pack id added when a checkbox is toggled on', () => {
    const onChange = vi.fn();
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={[]} onChange={onChange} />
    );
    fireEvent.click(screen.getByTestId('expansion-pack-toggle-button'));
    fireEvent.click(screen.getByTestId('expansion-pack-checkbox-mythic-realms'));

    expect(onChange).toHaveBeenCalledWith(['mythic-realms']);
  });

  it('calls onChange with the pack id removed when a checkbox is toggled off', () => {
    const onChange = vi.fn();
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={['mythic-realms', 'dark-lands']} onChange={onChange} />
    );
    fireEvent.click(screen.getByTestId('expansion-pack-toggle-button'));
    fireEvent.click(screen.getByTestId('expansion-pack-checkbox-mythic-realms'));

    expect(onChange).toHaveBeenCalledWith(['dark-lands']);
  });

  it('does not show the badge when no packs are enabled', () => {
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={[]} onChange={() => {}} />
    );
    const button = screen.getByTestId('expansion-pack-toggle-button');
    expect(button.querySelector('.bg-blue-500')).not.toBeInTheDocument();
  });

  it('shows a badge with the count of enabled packs', () => {
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={['mythic-realms']} onChange={() => {}} />
    );
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows badge count of 2 when both packs are enabled', () => {
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={['mythic-realms', 'dark-lands']} onChange={() => {}} />
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows "No expansion packs available" when packs list is empty', () => {
    render(
      <ExpansionPackToggle packs={[]} enabledPackIds={[]} onChange={() => {}} />
    );
    fireEvent.click(screen.getByTestId('expansion-pack-toggle-button'));
    expect(screen.getByText('No expansion packs available.')).toBeInTheDocument();
  });

  it('sets aria-expanded correctly based on panel state', () => {
    render(
      <ExpansionPackToggle packs={packs} enabledPackIds={[]} onChange={() => {}} />
    );
    const button = screen.getByTestId('expansion-pack-toggle-button');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
