import { Dialog } from '@/forest/components/dialog'

type NewGameDialogProps = { open: boolean; onOpenChange: (open: boolean) => void; onConfirm: () => void }

export function NewGameDialog({ open, onOpenChange, onConfirm }: NewGameDialogProps) {
	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
			title="Start a new game?"
			description="The board will be cleared. Players and colours stay the same."
			confirm="New game"
			onConfirm={onConfirm}
		/>
	)
}
