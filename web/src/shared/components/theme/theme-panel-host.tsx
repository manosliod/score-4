import { Suspense, use } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { BasicDialog } from '@/forest/components/basic-dialog'
import { BottomSheet } from '@/forest/components/bottom-sheet'
import type { ModalSurfaceProps } from '@/forest/components/dialog-surface'
import { showSnackbar } from '@/forest/components/snackbar'
import { useThemePanel, useThemePanelActions, useThemePanelOpens } from '@/shared/stores/theme-panel-store'
import type { ThemePanelVariant } from '@/shared/stores/theme-panel-store'

import { ThemeLoading } from './theme-loading'
import { themePanel } from './theme-panel-loader'

const visibleThemeButton = () =>
	[...document.querySelectorAll<HTMLElement>('[data-theme-button]')].find(
		(button) => button.getClientRects().length > 0
	) ?? null

export function ThemePanelHost() {
	const panel = useThemePanel()
	const opens = useThemePanelOpens()
	const { close, exited } = useThemePanelActions()

	const surface = (variant: ThemePanelVariant): ModalSurfaceProps => ({
		open: panel?.variant === variant && panel.open,
		finalFocus: visibleThemeButton,
		onOpenChange: (open) => {
			if (!open) {
				close()
			}
		},
		onOpenChangeComplete: (open) => {
			if (!open) {
				exited()
			}
		}
	})
	const content = (
		<div className="w-theme-picker max-w-full">
			<ErrorBoundary
				resetKeys={[opens]}
				onError={() => {
					if (panel?.open) {
						close()
						showSnackbar('Couldn’t open Theme. Try again.')
					}
				}}
				fallback={<ThemeLoading />}
			>
				<Suspense fallback={<ThemeLoading />}>
					<LazyThemePanel />
				</Suspense>
			</ErrorBoundary>
		</div>
	)

	return (
		<ErrorBoundary
			resetKeys={[opens]}
			onError={() => {
				close()
				exited()
			}}
			fallback={null}
		>
			<BottomSheet {...surface('sheet')} title="Theme">
				{content}
			</BottomSheet>
			<BasicDialog {...surface('dialog')} title="Theme" action="Done">
				{content}
			</BasicDialog>
		</ErrorBoundary>
	)
}

function LazyThemePanel() {
	const { ThemePanel } = themePanel.current() ?? use(themePanel.load())
	return <ThemePanel />
}
