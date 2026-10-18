import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export async function enterAges(page: Page, playerOne: string, playerTwo: string) {
	await page.goto('./')
	await page.getByLabel('Player 1 age').fill(playerOne)
	await page.getByLabel('Player 2 age').fill(playerTwo)
	await page.getByRole('button', { name: 'Continue' }).click()
}

export async function startGame(page: Page) {
	await enterAges(page, '30', '20')
	await page.getByRole('button', { name: 'Start game' }).click()
	await expect(page.getByRole('heading', { name: 'Player 2’s turn' })).toBeVisible()
}

export function column(page: Page, number: number) {
	return page.getByRole('gridcell', { name: new RegExp(`^Column ${String(number)},`) })
}

export async function dropAll(page: Page, columns: readonly number[]) {
	for (const number of columns) {
		await column(page, number).click({ force: true })
	}
}
