import { describe, it, expect } from 'vitest';
import { RAGNAROK_ONLINE_PACK } from './ragnarok-online';
import { computeAvailableContent, findStaleSelections } from '../../rules/expansion-packs';
import type { CharacterDraft } from '../../types/character';

const baseContent = {
  species: [],
  classes: [],
  backgrounds: [],
};

describe('RAGNAROK_ONLINE_PACK', () => {
  it('has the correct id, name, and description', () => {
    expect(RAGNAROK_ONLINE_PACK.id).toBe('ragnarok-online');
    expect(RAGNAROK_ONLINE_PACK.name).toBe('Ragnarok Online');
    expect(RAGNAROK_ONLINE_PACK.description).toContain('Ragnarok Online');
  });

  it('contains 2 species', () => {
    expect(RAGNAROK_ONLINE_PACK.species).toHaveLength(2);
    const names = RAGNAROK_ONLINE_PACK.species!.map(s => s.name);
    expect(names).toContain('Doram');
    expect(names).toContain('Aesir-Blooded');
  });

  it('contains 3 classes', () => {
    expect(RAGNAROK_ONLINE_PACK.classes).toHaveLength(3);
    const names = RAGNAROK_ONLINE_PACK.classes!.map(c => c.name);
    expect(names).toContain('Swordsman');
    expect(names).toContain('Mage');
    expect(names).toContain('Acolyte');
  });

  it('contains 2 backgrounds', () => {
    expect(RAGNAROK_ONLINE_PACK.backgrounds).toHaveLength(2);
    const names = RAGNAROK_ONLINE_PACK.backgrounds!.map(b => b.name);
    expect(names).toContain('Prontera Citizen');
    expect(names).toContain('Morroc Wanderer');
  });

  it('contains 4 equipment items', () => {
    expect(RAGNAROK_ONLINE_PACK.equipment).toHaveLength(4);
    const names = RAGNAROK_ONLINE_PACK.equipment!.map(e => e.name);
    expect(names).toContain('Katar');
    expect(names).toContain('Composite Bow');
    expect(names).toContain('Stiletto');
    expect(names).toContain('Rune Mail');
  });

  describe('species details', () => {
    it('Doram has speed 35 and is Small', () => {
      const doram = RAGNAROK_ONLINE_PACK.species!.find(s => s.name === 'Doram')!;
      expect(doram.speed).toBe(35);
      expect(doram.size).toBe('Small');
      expect(doram.abilityBonuses).toEqual({ DEX: 2, WIS: 1 });
      expect(doram.languages).toEqual(['Common', 'Doram']);
    });

    it('Aesir-Blooded has speed 30 and is Medium', () => {
      const aesir = RAGNAROK_ONLINE_PACK.species!.find(s => s.name === 'Aesir-Blooded')!;
      expect(aesir.speed).toBe(30);
      expect(aesir.size).toBe('Medium');
      expect(aesir.abilityBonuses).toEqual({ STR: 2, CON: 1 });
      expect(aesir.languages).toEqual(['Common', 'Norse']);
    });
  });

  describe('class details', () => {
    it('Swordsman has hitDie 10 and 2 subclasses', () => {
      const swordsman = RAGNAROK_ONLINE_PACK.classes!.find(c => c.name === 'Swordsman')!;
      expect(swordsman.hitDie).toBe(10);
      expect(swordsman.primaryAbility).toEqual(['STR', 'DEX']);
      expect(swordsman.savingThrows).toEqual(['STR', 'CON']);
      expect(swordsman.subclasses).toHaveLength(2);
      expect(swordsman.subclasses[0].name).toBe('Knight');
      expect(swordsman.subclasses[1].name).toBe('Crusader');
    });

    it('Mage has hitDie 6 and INT spellcasting', () => {
      const mage = RAGNAROK_ONLINE_PACK.classes!.find(c => c.name === 'Mage')!;
      expect(mage.hitDie).toBe(6);
      expect(mage.primaryAbility).toEqual(['INT']);
      expect(mage.spellcasting!.ability).toBe('INT');
      expect(mage.spellcasting!.cantripsKnown).toBe(3);
      expect(mage.spellcasting!.spellSlots).toBe(2);
      expect(mage.subclasses).toHaveLength(2);
      expect(mage.subclasses[0].name).toBe('Wizard');
      expect(mage.subclasses[1].name).toBe('Sage');
    });

    it('Acolyte class has hitDie 8 and WIS spellcasting with spellsPrepared', () => {
      const acolyte = RAGNAROK_ONLINE_PACK.classes!.find(c => c.name === 'Acolyte')!;
      expect(acolyte.hitDie).toBe(8);
      expect(acolyte.primaryAbility).toEqual(['WIS']);
      expect(acolyte.spellcasting!.ability).toBe('WIS');
      expect(acolyte.spellcasting!.cantripsKnown).toBe(3);
      expect(acolyte.spellcasting!.spellSlots).toBe(2);
      expect(acolyte.spellcasting!.spellsPrepared).toBe(4);
      expect(acolyte.subclasses).toHaveLength(2);
      expect(acolyte.subclasses[0].name).toBe('Priest');
      expect(acolyte.subclasses[1].name).toBe('Monk');
    });
  });

  describe('background details', () => {
    it('Prontera Citizen has correct skills and origin feat', () => {
      const prontera = RAGNAROK_ONLINE_PACK.backgrounds!.find(b => b.name === 'Prontera Citizen')!;
      expect(prontera.skillProficiencies).toEqual(['Athletics', 'Religion']);
      expect(prontera.originFeat).toBe('Sentinel');
      expect(prontera.abilityOptions).toEqual(['STR', 'WIS', 'CHA']);
    });

    it('Morroc Wanderer has correct skills and origin feat', () => {
      const morroc = RAGNAROK_ONLINE_PACK.backgrounds!.find(b => b.name === 'Morroc Wanderer')!;
      expect(morroc.skillProficiencies).toEqual(['Deception', 'Survival']);
      expect(morroc.originFeat).toBe('Alert');
      expect(morroc.abilityOptions).toEqual(['DEX', 'INT', 'CHA']);
    });
  });
});

describe('computeAvailableContent with Ragnarok Online pack', () => {
  it('includes RO content when pack is enabled', () => {
    const result = computeAvailableContent(
      ['ragnarok-online'],
      [RAGNAROK_ONLINE_PACK],
      baseContent,
    );

    expect(result.species).toHaveLength(2);
    expect(result.species[1].source).toBe('Ragnarok Online');
    expect(result.species[1].items).toHaveLength(2);
    expect(result.species[1].items.map(s => s.name)).toContain('Doram');
    expect(result.species[1].items.map(s => s.name)).toContain('Aesir-Blooded');

    expect(result.classes).toHaveLength(2);
    expect(result.classes[1].source).toBe('Ragnarok Online');
    expect(result.classes[1].items).toHaveLength(3);

    expect(result.backgrounds).toHaveLength(2);
    expect(result.backgrounds[1].source).toBe('Ragnarok Online');
    expect(result.backgrounds[1].items).toHaveLength(2);
  });

  it('does not include RO content when pack is disabled', () => {
    const result = computeAvailableContent([], [RAGNAROK_ONLINE_PACK], baseContent);

    expect(result.species).toHaveLength(1);
    expect(result.classes).toHaveLength(1);
    expect(result.backgrounds).toHaveLength(1);
  });
});

describe('findStaleSelections with Ragnarok Online pack', () => {
  it('clears Doram species when pack is disabled', () => {
    const doram = RAGNAROK_ONLINE_PACK.species![0];
    const character: CharacterDraft = { species: doram };

    const baseOnly = computeAvailableContent([], [RAGNAROK_ONLINE_PACK], baseContent);
    const stale = findStaleSelections(character, baseOnly);

    expect('species' in stale).toBe(true);
    expect(stale.species).toBeUndefined();
  });

  it('does not clear Doram species when pack is enabled', () => {
    const doram = RAGNAROK_ONLINE_PACK.species![0];
    const character: CharacterDraft = { species: doram };

    const withPack = computeAvailableContent(
      ['ragnarok-online'],
      [RAGNAROK_ONLINE_PACK],
      baseContent,
    );
    const stale = findStaleSelections(character, withPack);

    expect(Object.keys(stale)).toHaveLength(0);
  });
});
