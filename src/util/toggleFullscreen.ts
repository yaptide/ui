//add properties to Document interface
declare global {
	interface Document {
		webkitFullscreenElement: unknown;
		webkitExitFullscreen: () => void;
	}
	interface HTMLElement {
		webkitRequestFullscreen: () => void;
	}
}

export function toggleFullscreen() {
	return document.exitFullscreen
		? document.fullscreenElement === null
			? document.documentElement.requestFullscreen()
			: document.exitFullscreen()
		: document.webkitFullscreenElement === null //Safari
		? document.documentElement.webkitRequestFullscreen()
		: document.webkitExitFullscreen();
}
