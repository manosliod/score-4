import arrowBack from '@material-symbols/svg-400/outlined/arrow_back.svg'
import brightnessAuto from '@material-symbols/svg-400/outlined/brightness_auto.svg'
import check from '@material-symbols/svg-400/outlined/check.svg'
import darkMode from '@material-symbols/svg-400/outlined/dark_mode.svg'
import error from '@material-symbols/svg-400/outlined/error-fill.svg'
import lightMode from '@material-symbols/svg-400/outlined/light_mode.svg'
import refresh from '@material-symbols/svg-400/outlined/refresh.svg'
import type { CSSProperties } from 'react'

const icons = { arrowBack, brightnessAuto, check, darkMode, error, lightMode, refresh }

export type IconName = keyof typeof icons

type IconProps = { name: IconName; className?: string }

export function Icon({ name, className = 'size-icon' }: IconProps) {
	const style = { '--icon': `url(${JSON.stringify(icons[name])})` } as CSSProperties
	return <span aria-hidden="true" className={`icon shrink-0 bg-current ${className}`} style={style} />
}
