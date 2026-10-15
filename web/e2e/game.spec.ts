import { expect, test } from '@playwright/test'

import { tieMoves } from '../src/testing/factories'

import { column, dropAll, enterAges, startGame } from './play'

test('a tap drops a coin and passes the turn', async ({ page }) => {
	await startGame(page)
	await column(page, 3).click()
	await expect(column(page, 3)).toHaveAccessibleName('Column 3, 5 free')
	await expect(page.getByRole('heading', { name: 'Player 1’s turn' })).toBeVisible()
	await expect(page.getByText('Red dropped in column 3. Player 1’s turn.')).toBeAttached()
})

test('four in a row wins and Play again keeps the players', async ({ page }) => {
	await startGame(page)
	await dropAll(page, [2, 2, 3, 3, 4, 4, 5])
	await expect(page.getByRole('heading', { name: 'Player 2 wins!' })).toBeVisible()
	await expect(page.getByText('Four in a row for Red, in 7 moves.')).toBeVisible()
	await expect(column(page, 1)).toHaveAttribute('aria-disabled', 'true')
	await page.getByRole('button', { name: 'Play again' }).click()
	await expect(page.getByRole('heading', { name: 'Player 2’s turn' })).toBeVisible()
	await expect(column(page, 2)).toHaveAccessibleName('Column 2, 6 free')
})

test('a full board with no line is a tie, and New players goes back to the start', async ({ page }) => {
	await enterAges(page, '20', '30')
	await page.getByRole('button', { name: 'Start game' }).click()
	await dropAll(page, tieMoves)
	await expect(page.getByRole('heading', { name: 'It’s a tie' })).toBeVisible()
	await page.getByRole('button', { name: 'New players' }).click()
	await expect(page.getByLabel('Player 1 age')).toHaveValue('')
})

test('a full column is refused with a snackbar and the same player moves again', async ({ page }) => {
	await startGame(page)
	await dropAll(page, [4, 4, 4, 4, 4, 4, 4])
	await expect(page.getByText('Column 4 is full. Pick another column.')).toBeVisible()
	await expect(page.getByRole('heading', { name: 'Player 2’s turn' })).toBeVisible()
	await expect(column(page, 4)).toHaveAttribute('aria-disabled', 'true')
	await dropAll(page, [3])
	await expect(page.getByText('Column 4 is full. Pick another column.')).toBeHidden()
})

test('the keyboard moves between columns and drops with Enter', async ({ page }) => {
	await startGame(page)
	await column(page, 1).focus()
	await page.keyboard.press('End')
	await expect(column(page, 7)).toBeFocused()
	await page.keyboard.press('ArrowLeft')
	await page.keyboard.press('Enter')
	await expect(column(page, 6)).toHaveAccessibleName('Column 6, 5 free')
	await page.keyboard.press('Home')
	await page.keyboard.press(' ')
	await expect(column(page, 1)).toHaveAccessibleName('Column 1, 5 free')
})

test('the new game dialog keeps the board on Cancel and clears it on New game', async ({ page }) => {
	await startGame(page)
	await column(page, 1).click()
	await page.getByRole('button', { name: 'New game' }).click()
	await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click()
	await expect(page.getByRole('alertdialog')).toBeHidden()
	await expect(column(page, 1)).toHaveAccessibleName('Column 1, 5 free')
	await page.getByRole('button', { name: 'New game' }).click()
	await page.getByRole('alertdialog').getByRole('button', { name: 'New game' }).click()
	await expect(column(page, 1)).toHaveAccessibleName('Column 1, 6 free')
})

test('an engine that fails to load shows the error, and Try again recovers', async ({ page }) => {
	let failing = true
	await page.route('**/*.wasm', (route) => (failing ? route.abort() : route.continue()))
	await page.goto('/')
	await page.getByLabel('Player 1 age').fill('30')
	await page.getByLabel('Player 2 age').fill('20')
	await page.getByRole('button', { name: 'Continue' }).click()
	await expect(page.getByText('The game couldn’t start')).toBeVisible()
	failing = false
	await page.getByRole('button', { name: 'Try again' }).click()
	await page.getByRole('button', { name: 'Continue' }).click()
	await expect(page.getByRole('heading', { name: 'Player 2 goes first' })).toBeVisible()
})

test('a game screen that fails to download shows the error, and Try again recovers', async ({ page }) => {
	let failing = true
	await page.route('**/game-round-*.js', (route) => (failing ? route.abort() : route.continue()))
	await enterAges(page, '30', '20')
	await page.getByRole('button', { name: 'Start game' }).click()
	await expect(page.getByText('The game couldn’t start')).toBeVisible()
	failing = false
	await page.getByRole('button', { name: 'Try again' }).click()
	await expect(page.getByRole('heading', { name: 'Player 2’s turn' })).toBeVisible()
})
