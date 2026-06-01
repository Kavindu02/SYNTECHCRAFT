declare module '*.css'
declare module 'particles.js'

interface Window {
	particlesJS?: (tagId: string, params: Record<string, unknown>) => void
	pJSDom?: Array<{
		pJS?: {
			fn?: {
				vendors?: {
					destroypJS?: () => void
				}
			}
			canvas?: {
				el?: HTMLCanvasElement
			}
		}
	}>
}
