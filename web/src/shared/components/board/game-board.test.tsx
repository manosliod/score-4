import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { boardSize, emptyColumn } from '@/shared/types/game'
import type { Column } from '@/shared/types/game'

import { GameBoard } from './game-board'

const fullColumn: Column = Array.from({ length: boardSize.rows }, () => 'red')

const aBoard = (full: readonly number[] = []) =>
	Array.from({ length: boardSize.columns }, (_, index) => (full.includes(index + 1) ? fullColumn : emptyColumn))

const column = (number: number) => screen.getByRole('gridcell', { name: new RegExp(`^Column ${String(number)},`) })

describe('game board', () => {
	it('names each column with its free spots', () => {
		render(<GameBoard columns={aBoard([2])} interactive />)
		expect(column(1)).toHaveAccessibleName('Column 1, 6 free')
		expect(column(2)).toHaveAccessibleName('Column 2, 0 free')
		expect(column(2)).toHaveAttribute('aria-disabled', 'true')
	})

	it('moves between playable columns with the keyboard and drops with Enter', () => {
		const onDrop = vi.fn()
		render(<GameBoard columns={aBoard([2])} interactive onDrop={onDrop} />)
		column(1).focus()
		fireEvent.keyDown(column(1), { key: 'ArrowRight' })
		expect(column(3)).toHaveFocus()
		fireEvent.keyDown(column(3), { key: 'End' })
		expect(column(7)).toHaveFocus()
		fireEvent.keyDown(column(7), { key: 'Enter' })
		expect(onDrop).toHaveBeenCalledWith(7)
	})

	it('ignores taps when the game is over', () => {
		const onDrop = vi.fn()
		render(<GameBoard columns={aBoard()} onDrop={onDrop} />)
		fireEvent.click(column(1))
		expect(onDrop).not.toHaveBeenCalled()
		expect(screen.getByRole('grid')).toHaveAttribute('aria-readonly', 'true')
	})
})
