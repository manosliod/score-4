import type { ReactNode } from 'react'

type AppBarProps = { title: string; leading?: ReactNode; trailing?: ReactNode }

export function AppBar({ title, leading, trailing }: AppBarProps) {
	return (
		<header className="flex h-16 shrink-0 items-center gap-1 px-1">
			<div className="flex size-touch items-center justify-center">{leading}</div>
			<h1 className="flex-1 text-title-large text-on-surface">{title}</h1>
			<div className="flex min-w-touch items-center justify-end gap-2 px-1">{trailing}</div>
		</header>
	)
}
