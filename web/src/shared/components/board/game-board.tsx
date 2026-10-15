import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'

import type { BoardPosition, Column } from '@/shared/types/game'

import { BoardColumn } from './board-column'

type GameBoardProps = {
	columns: readonly Column[]
	winningLine?: readonly BoardPosition[]
	lastDrop?: BoardPosition | null
	interactive?: boolean
	alwaysCompact?: boolean
	onDrop?: (column: number) => void
}

const noLine: readonly BoardPosition[] = []
const ignoreDrop = () => undefined

export function GameBoard({
	columns,
	winningLine = noLine,
	lastDrop = null,
	interactive = false,
	alwaysCompact = false,
	onDrop = ignoreDrop
}: GameBoardProps) {
	const elements = useRef<(HTMLDivElement | null)[]>([])
	const [focused, setFocused] = useState(1)

	const numbers = columns.map((_, index) => index + 1)
	const isPlayable = (number: number) => interactive && columns[number - 1]?.[0] === null
	const playable = numbers.filter(isPlayable)
	const tabStop = isPlayable(focused) ? focused : (playable[0] ?? 1)

	function moveFocus(target: number | undefined) {
		if (target === undefined) {
			return
		}
		setFocused(target)
		elements.current[target - 1]?.focus()
	}

	function handleKey(event: KeyboardEvent<HTMLDivElement>, column: number) {
		const targets: Partial<Record<string, number | undefined>> = {
			ArrowLeft: playable.filter((candidate) => candidate < column).at(-1),
			ArrowRight: playable.find((candidate) => candidate > column),
			Home: playable[0],
			End: playable.at(-1)
		}
		if (event.key in targets) {
			event.preventDefault()
			moveFocus(targets[event.key])
		} else if ((event.key === 'Enter' || event.key === ' ') && interactive) {
			event.preventDefault()
			onDrop(column)
		}
	}

	return (
		<div
			role="grid"
			aria-label="Score 4 board"
			aria-readonly={interactive ? undefined : true}
			className={`board flex shrink-0 bg-primary text-on-primary ${alwaysCompact ? 'always-compact' : ''}`}
		>
			<div role="row" className="flex">
				{columns.map((cells, index) => (
					<BoardColumn
						key={index}
						ref={(element) => {
							elements.current[index] = element
						}}
						number={index + 1}
						cells={cells}
						winningRows={winningLine.filter((cell) => cell.column === index).map((cell) => cell.row)}
						droppedRow={lastDrop?.column === index ? lastDrop.row : null}
						interactive={interactive}
						playable={isPlayable(index + 1)}
						tabStop={interactive && tabStop === index + 1}
						onDrop={onDrop}
						onKeyDown={handleKey}
					/>
				))}
			</div>
		</div>
	)
}
