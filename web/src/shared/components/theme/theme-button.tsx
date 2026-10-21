import { IconButton } from '@/forest/components/icon-button'
import { themeIcons } from '@/forest/theme'
import { useThemeSync } from '@/shared/hooks/use-theme-sync'
import { useThemePanelActions } from '@/shared/stores/theme-panel-store'
import { useTheme } from '@/shared/stores/theme-store'

import { preloadThemePanel, themePanel } from './theme-panel-loader'

export function ThemeButton() {
	const theme = useTheme()
	const { open } = useThemePanelActions()
	useThemeSync()

	return (
		<IconButton
			data-theme-button=""
			icon={themeIcons[theme]}
			label="Theme"
			aria-haspopup="dialog"
			onPointerEnter={preloadThemePanel}
			onFocus={preloadThemePanel}
			onClick={() => {
				themePanel.retry()
				preloadThemePanel()
				open()
			}}
		/>
	)
}
