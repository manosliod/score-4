import type { ComponentProps } from 'react'

type ButtonProps = { variant?: 'filled' | 'outlined' | 'text' } & ComponentProps<'button'>

const variants = {
	filled: 'bg-primary text-on-primary disabled:bg-on-surface/10 disabled:text-on-surface/38',
	outlined: 'border border-outline-variant text-on-surface-variant disabled:text-on-surface/38',
	text: 'text-primary disabled:text-on-surface/38'
} as const satisfies Record<NonNullable<ButtonProps['variant']>, string>

export function Button({ variant = 'filled', type = 'button', className = '', ...props }: ButtonProps) {
	return (
		<button
			type={type}
			className={`state-layer target press relative inline-flex h-control items-center justify-center rounded-full px-4 text-label-large disabled:cursor-default ${variants[variant]} ${className}`}
			{...props}
		/>
	)
}
