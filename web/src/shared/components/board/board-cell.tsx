import { Coin } from '@/shared/components/coin'
import type { CellContent } from '@/shared/types/game'

type BoardCellProps = { content: CellContent; row: number; winning: boolean; dropped: boolean }

export function BoardCell({ content, row, winning, dropped }: BoardCellProps) {
	return (
		<span className="board-cell flex items-center justify-center">
			<span className="board-hole relative flex items-center justify-center rounded-full bg-surface-container-lowest">
				{content ? <Coin colour={content} dropRows={dropped ? row + 1 : undefined} /> : null}
				{winning ? <span className="win-ring absolute inset-0 rounded-full border-on-primary" /> : null}
			</span>
		</span>
	)
}
