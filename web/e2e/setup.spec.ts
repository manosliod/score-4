import { expect, test } from '@playwright/test'

import { enterAges, expectSegmentEnds } from './play'

test('Continue waits for both ages', async ({ page }) => {
	await page.goto('./')
	const next = page.getByRole('button', { name: 'Continue' })
	await expect(next).toBeDisabled()
	await page.getByLabel('Player 1 age').fill('20')
	await expect(next).toBeDisabled()
	await page.getByLabel('Player 2 age').fill('30')
	await expect(next).toBeEnabled()
})

test('an age that is not a whole number is flagged on its field', async ({ page }) => {
	await enterAges(page, '20', 'ten')
	await expect(page.getByLabel('Player 2 age')).toHaveAttribute('aria-invalid', 'true')
	await expect(page.getByText('Enter a whole number, like 12')).toBeVisible()
	await expect(page.getByRole('heading', { name: 'Who’s playing?' })).toBeVisible()
})

test('the younger player starts and picks a colour; the other gets the other one', async ({ page }) => {
	await enterAges(page, '30', '20')
	await expect(page.getByRole('heading', { name: 'Player 2 goes first' })).toBeVisible()
	await page.getByRole('radio', { name: 'Yellow' }).click()
	const players = page.getByRole('list', { name: 'Players' })
	await expect(players).toContainText('Player 2Yellow')
	await expect(players).toContainText('Player 1Red')
})

test('equal ages let Player 1 start', async ({ page }) => {
	await enterAges(page, '25', '25')
	await expect(page.getByRole('heading', { name: 'Player 1 goes first' })).toBeVisible()
	await expect(page.getByText('You’re the same age, so Player 1 starts.')).toBeVisible()
})

test('Change ages and Back return to the ages with the values kept', async ({ page }) => {
	await enterAges(page, '30', '20')
	await page.getByRole('button', { name: 'Change ages' }).click()
	await expect(page.getByLabel('Player 1 age')).toHaveValue('30')
	await page.getByRole('button', { name: 'Continue' }).click()
	await page.getByRole('button', { name: 'Back' }).click()
	await expect(page.getByLabel('Player 2 age')).toHaveValue('20')
})

test("with Yellow checked the colour choice keeps the group's rounded ends and dividers between segments", async ({
	page
}) => {
	await enterAges(page, '30', '20')
	const yellow = page.getByRole('radio', { name: 'Yellow' })
	await yellow.click()
	await expect(yellow).toBeChecked()
	await expectSegmentEnds(page.getByRole('radiogroup', { name: 'Player 2’s colour' }))
})
