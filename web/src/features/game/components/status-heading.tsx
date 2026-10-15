type StatusHeadingProps = { headline: string; supporting?: string; result?: boolean }

export function StatusHeading({ headline, supporting, result = false }: StatusHeadingProps) {
	return (
		<div className={`flex w-full flex-col gap-1 ${result ? 'result-in' : ''}`}>
			<h2 className="text-headline-small text-on-surface expanded:text-headline-medium">{headline}</h2>
			{supporting ? <p className="text-body-medium text-on-surface-variant">{supporting}</p> : null}
		</div>
	)
}
