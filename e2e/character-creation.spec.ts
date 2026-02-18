import { test, expect } from '@playwright/test';
import { percySnapshot } from '@percy/playwright';

/**
 * End-to-end flow for the full D&D character creation wizard.
 *
 * Playwright drives the browser and asserts functional correctness;
 * percySnapshot() uploads each step to Percy for visual diff review.
 * Percy compares against the approved baseline and posts a status check on
 * the PR.  An automated Claude vision agent (percy-review.yml) reviews any
 * diffs and either auto-approves or flags them for human attention.
 *
 * Running locally without PERCY_TOKEN set is fine — percySnapshot() is a
 * no-op when the token is absent, so the functional assertions still run.
 */

test('full character creation wizard', async ({ page }) => {
  await page.goto('/');

  // ─── Start page ───────────────────────────────────────────────────────────
  await expect(
    page.getByRole('heading', { name: 'Welcome to D&D 5e Character Creator' })
  ).toBeVisible();
  await page.getByRole('button', { name: 'Create New Character' }).click();

  // ─── Step 1: Name ─────────────────────────────────────────────────────────
  await expect(
    page.getByRole('heading', { name: 'Name Your Character' })
  ).toBeVisible();

  await page.getByLabel('Character Name').fill('Aria Swiftwind');

  await percySnapshot(page, '01 Name step', { fullPage: true });

  // ─── Step 2: Species ───────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Species' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Your Species' })
  ).toBeVisible();

  // Human has no subspecies, so clicking it immediately saves to character state.
  await page
    .locator('button', {
      has: page.getByRole('heading', { name: 'Human', level: 3 }),
    })
    .click();

  await percySnapshot(page, '02 Species step — Human selected', { fullPage: true });

  // ─── Step 3: Class ─────────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Class' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Your Class' })
  ).toBeVisible();

  await page.getByTestId('class-card-fighter').click();
  await expect(page.getByTestId('class-detail-panel')).toBeVisible();

  await percySnapshot(page, '03 Class step — Fighter selected', { fullPage: true });

  // ─── Step 4: Ability Scores ────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Ability Scores' }).click();
  await expect(
    page.getByRole('heading', { name: 'Assign Ability Scores' })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Standard Array' }).click();

  // Assign the standard array [15, 14, 13, 12, 10, 8] across the six abilities.
  await page.getByLabel('Select score for STR').selectOption('15');
  await page.getByLabel('Select score for DEX').selectOption('14');
  await page.getByLabel('Select score for CON').selectOption('13');
  await page.getByLabel('Select score for INT').selectOption('12');
  await page.getByLabel('Select score for WIS').selectOption('10');
  await page.getByLabel('Select score for CHA').selectOption('8');

  await expect(page.getByText('✓ All values assigned!')).toBeVisible();

  await percySnapshot(page, '04 Ability Scores step — standard array assigned', { fullPage: true });

  // ─── Step 5: Background ────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Background' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Your Background' })
  ).toBeVisible();

  await page.getByTestId('background-card-soldier').click();
  await expect(page.getByTestId('background-detail-panel')).toBeVisible();

  await percySnapshot(page, '05 Background step — Soldier selected', { fullPage: true });

  // ─── Step 6: Equipment ─────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Equipment' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Equipment' })
  ).toBeVisible();

  // Fighter has three equipment choices.
  await page.getByTestId('choice-0-option-0').click(); // Chain Mail
  await page.getByTestId('choice-1-option-0').click(); // Martial weapon + shield
  await page.getByTestId('choice-2-option-0').click(); // Light crossbow + 20 bolts

  await expect(page.getByTestId('equipment-summary')).toBeVisible();

  await percySnapshot(page, '06 Equipment step — all choices made', { fullPage: true });

  // ─── Step 7: Review (Character Sheet) ─────────────────────────────────────
  await page.getByRole('link', { name: 'Review' }).click();
  await expect(
    page.getByRole('heading', { name: 'Character Sheet' })
  ).toBeVisible();

  await expect(page.getByTestId('character-name')).toHaveText('Aria Swiftwind');
  await expect(page.getByTestId('character-class')).toHaveText('Fighter');
  await expect(page.getByTestId('character-background')).toHaveText('Soldier');

  await percySnapshot(page, '07 Review step — complete character sheet', { fullPage: true });
});

test('expansion pack character creation with grouped content', async ({ page }) => {
  await page.goto('/');

  // ─── Enable Mythic Realms expansion pack ────────────────────────────────
  await page.getByTestId('expansion-pack-toggle-button').click();
  await expect(page.getByTestId('expansion-pack-panel')).toBeVisible();
  await page.getByTestId('expansion-pack-checkbox-mythic-realms').check();

  // Badge shows 1 enabled pack
  await expect(
    page.getByTestId('expansion-pack-toggle-button').locator('span').filter({ hasText: '1' })
  ).toBeVisible();

  // Close the dropdown
  await page.getByTestId('expansion-pack-toggle-button').click();
  await expect(page.getByTestId('expansion-pack-panel')).not.toBeVisible();

  // ─── Start page ───────────────────────────────────────────────────────────
  await page.getByRole('button', { name: 'Create New Character' }).click();

  // ─── Step 1: Name ─────────────────────────────────────────────────────────
  await page.getByLabel('Character Name').fill('Celestia Brightforge');

  // ─── Step 2: Species (grouped content) ────────────────────────────────────
  await page.getByRole('link', { name: 'Species' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Your Species' })
  ).toBeVisible();

  // With expansion pack enabled, section headers should be visible
  await expect(page.getByRole('heading', { name: 'Base Content', level: 3 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mythic Realms', level: 3 })).toBeVisible();

  // Select Aasimar (has subspecies)
  await page
    .locator('button', {
      has: page.getByRole('heading', { name: 'Aasimar', level: 3 }),
    })
    .click();

  // Subspecies picker should appear
  await expect(
    page.getByRole('heading', { name: 'Choose Your Subspecies' })
  ).toBeVisible();

  // Select Protector Aasimar
  await page
    .locator('button', {
      has: page.getByRole('heading', { name: 'Protector Aasimar', level: 4 }),
    })
    .click();

  await percySnapshot(page, '08 Species step — Aasimar Protector selected (expansion pack)', { fullPage: true });

  // ─── Step 3: Class (grouped content) ──────────────────────────────────────
  await page.getByRole('link', { name: 'Class' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Your Class' })
  ).toBeVisible();

  // Section headers visible when expansion pack is active
  await expect(page.getByRole('heading', { name: 'Base Content', level: 3 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mythic Realms', level: 3 })).toBeVisible();

  // Select Artificer from expansion pack
  await page.getByTestId('class-card-artificer').click();
  await expect(page.getByTestId('class-detail-panel')).toBeVisible();

  // Verify Artificer-specific details
  await expect(page.getByTestId('spellcasting-section')).toBeVisible();
  await expect(page.getByTestId('spellcasting-ability')).toContainText('INT');

  await percySnapshot(page, '09 Class step — Artificer selected (expansion pack)', { fullPage: true });

  // ─── Step 4: Ability Scores ───────────────────────────────────────────────
  await page.getByRole('link', { name: 'Ability Scores' }).click();
  await page.getByRole('button', { name: 'Standard Array' }).click();

  await page.getByLabel('Select score for STR').selectOption('8');
  await page.getByLabel('Select score for DEX').selectOption('14');
  await page.getByLabel('Select score for CON').selectOption('13');
  await page.getByLabel('Select score for INT').selectOption('15');
  await page.getByLabel('Select score for WIS').selectOption('12');
  await page.getByLabel('Select score for CHA').selectOption('10');

  await expect(page.getByText('✓ All values assigned!')).toBeVisible();

  // ─── Step 5: Background (grouped content) ─────────────────────────────────
  await page.getByRole('link', { name: 'Background' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Your Background' })
  ).toBeVisible();

  // Section headers visible
  await expect(page.getByRole('heading', { name: 'Base Content', level: 3 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Mythic Realms', level: 3 })).toBeVisible();

  // Select Far Traveler from expansion pack
  await page.getByTestId('background-card-far traveler').click();
  await expect(page.getByTestId('background-detail-panel')).toBeVisible();

  await percySnapshot(page, '10 Background step — Far Traveler selected (expansion pack)', { fullPage: true });

  // ─── Step 6: Equipment ────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Equipment' }).click();
  await expect(
    page.getByRole('heading', { name: 'Choose Equipment' })
  ).toBeVisible();

  // Artificer has one equipment choice
  await page.getByTestId('choice-0-option-0').click();
  await expect(page.getByTestId('equipment-summary')).toBeVisible();

  // ─── Step 7: Review ───────────────────────────────────────────────────────
  await page.getByRole('link', { name: 'Review' }).click();
  await expect(
    page.getByRole('heading', { name: 'Character Sheet' })
  ).toBeVisible();

  await expect(page.getByTestId('character-name')).toHaveText('Celestia Brightforge');
  await expect(page.getByTestId('character-species')).toContainText('Aasimar');
  await expect(page.getByTestId('character-class')).toHaveText('Artificer');
  await expect(page.getByTestId('character-background')).toHaveText('Far Traveler');

  // Spellcasting section should appear for Artificer
  await expect(page.getByTestId('spellcasting-section')).toBeVisible();

  await percySnapshot(page, '11 Review step — expansion pack character sheet', { fullPage: true });
});

test('stale selections cleared when expansion pack is disabled', async ({ page }) => {
  await page.goto('/');

  // ─── Enable Mythic Realms and select expansion pack content ───────────────
  await page.getByTestId('expansion-pack-toggle-button').click();
  await page.getByTestId('expansion-pack-checkbox-mythic-realms').check();
  await page.getByTestId('expansion-pack-toggle-button').click();

  // ─── Start page ───────────────────────────────────────────────────────────
  await page.getByRole('button', { name: 'Create New Character' }).click();

  // Select Aasimar species
  await page.getByRole('link', { name: 'Species' }).click();
  await page
    .locator('button', {
      has: page.getByRole('heading', { name: 'Aasimar', level: 3 }),
    })
    .click();
  await page
    .locator('button', {
      has: page.getByRole('heading', { name: 'Protector Aasimar', level: 4 }),
    })
    .click();

  // Select Artificer class
  await page.getByRole('link', { name: 'Class' }).click();
  await page.getByTestId('class-card-artificer').click();
  await expect(page.getByTestId('class-detail-panel')).toBeVisible();

  // Select Far Traveler background
  await page.getByRole('link', { name: 'Background' }).click();
  await page.getByTestId('background-card-far traveler').click();
  await expect(page.getByTestId('background-detail-panel')).toBeVisible();

  // ─── Disable the expansion pack ──────────────────────────────────────────
  await page.getByTestId('expansion-pack-toggle-button').click();
  await page.getByTestId('expansion-pack-checkbox-mythic-realms').uncheck();
  await page.getByTestId('expansion-pack-toggle-button').click();

  // ─── Verify stale selections are cleared ─────────────────────────────────

  // Species step: Aasimar should no longer be visible, no species selected
  await page.getByRole('link', { name: 'Species' }).click();
  await expect(
    page.locator('button', {
      has: page.getByRole('heading', { name: 'Aasimar', level: 3 }),
    })
  ).not.toBeVisible();

  // Section headers should disappear (only one group = base content)
  await expect(
    page.getByRole('heading', { name: 'Base Content', level: 3 })
  ).not.toBeVisible();

  // No subspecies picker should be visible
  await expect(
    page.getByRole('heading', { name: 'Choose Your Subspecies' })
  ).not.toBeVisible();

  // Class step: Artificer should no longer be visible
  await page.getByRole('link', { name: 'Class' }).click();
  await expect(page.getByTestId('class-card-artificer')).not.toBeVisible();
  await expect(page.getByTestId('class-detail-panel')).not.toBeVisible();

  // Background step: Far Traveler should no longer be visible
  await page.getByRole('link', { name: 'Background' }).click();
  await expect(page.getByTestId('background-card-far traveler')).not.toBeVisible();
  await expect(page.getByTestId('background-detail-panel')).not.toBeVisible();

  // Review step: selections should be cleared
  await page.getByRole('link', { name: 'Review' }).click();
  await expect(page.getByTestId('character-species')).toHaveText('Not selected');
  await expect(page.getByTestId('character-class')).toHaveText('Not selected');
  await expect(page.getByTestId('character-background')).toHaveText('Not selected');

  await percySnapshot(page, '12 Review step — cleared after pack disabled', { fullPage: true });
});
