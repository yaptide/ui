// Types and pure helpers for exporting a viewport as an image (MVP: active 3D view, opaque, 1x).
// Kept free of WebGL/three.js so the logic can be unit-tested without a rendering context.

export type ExportImageFormat = 'image/png' | 'image/jpeg';

/** Render strategies. Only `sharedResize` is implemented in the MVP; stage 2 adds an offscreen one. */
export type ViewportRenderStrategy = 'sharedResize';

export interface ExportImageOptions {
	/** Hide the ground grid in the exported image. Defaults to `true`. */
	hideGrid?: boolean;
	/** Hide gizmo, axes, selection box and camera/light helpers. Defaults to `true`. */
	hideHelpers?: boolean;
	/**
	 * Export only the simulation geometry, dropping every helper overlay: the grid, the selection
	 * box, the corner/view gizmos and everything in `sceneHelpers` (the beam, the world-zone
	 * boundary and the plane/camera/light helpers). Detector, zone and figure geometry is kept.
	 * When `true`, `hideGrid` and `hideHelpers` are ignored. Defaults to `false`.
	 */
	geometryOnly?: boolean;
	/** Output mime type. The MVP UI only offers `image/png`. */
	format?: ExportImageFormat;
	/** JPEG quality in the 0..1 range. Ignored for PNG. Defaults to `0.92`. */
	quality?: number;
	/** Explicit file name. When set, the caller can skip the filename dialog. */
	filename?: string;
}

export interface ExportImageResult {
	blob: Blob;
	width: number;
	height: number;
	viewName: string;
	canvas: HTMLCanvasElement;
}

export type ExportImageErrorCode =
	| 'unknown-view'
	| 'unknown-strategy'
	| 'canvas-limit'
	| 'blob-null'
	| 'security-error'
	| 'encode-failed';

export class ExportImageError extends Error {
	readonly code: ExportImageErrorCode;

	constructor(code: ExportImageErrorCode, message: string) {
		super(message);
		this.name = 'ExportImageError';
		this.code = code;
	}
}

/** Conservative per-side limit for the MVP. Real GPU limits are usually higher. */
export const MAX_EXPORT_SIDE = 8192;

/** Conservative total-area limit (in pixels) to stay safe on Safari/iOS. */
export const MAX_EXPORT_AREA = 16000000;

export interface ExportSize {
	width: number;
	height: number;
}

/** Minimal structural type so the encoder can be tested with a light canvas stand-in. */
export type CanvasLike = Pick<HTMLCanvasElement, 'toBlob'>;

/**
 * Effective per-side limit: never larger than {@link MAX_EXPORT_SIDE}, even when the GPU reports
 * more. Falls back to {@link MAX_EXPORT_SIDE} when the reported value is not a positive finite
 * number.
 */
export function getMaxExportSide(maxTextureSize?: number): number {
	if (
		typeof maxTextureSize === 'number' &&
		Number.isFinite(maxTextureSize) &&
		maxTextureSize > 0
	) {
		return Math.min(maxTextureSize, MAX_EXPORT_SIDE);
	}

	return MAX_EXPORT_SIDE;
}

/**
 * Scales `width`/`height` down (preserving aspect ratio) so that neither side exceeds `maxSide`
 * and the total area does not exceed {@link MAX_EXPORT_AREA}. Returns the requested size unchanged
 * when it already fits.
 *
 * The MVP exports at native 1x resolution and cannot render a different buffer size, so a changed
 * result means the viewport cannot be exported at full resolution: the caller must raise a clear
 * error instead of silently scaling (downscaling lands in stage 2).
 *
 * @throws {ExportImageError} when `width`/`height` are not finite positive numbers.
 */
export function clampExportSize(width: number, height: number, maxSide: number): ExportSize {
	if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
		throw new ExportImageError(
			'canvas-limit',
			`Invalid viewport size: ${width}x${height}. Expected finite positive numbers.`
		);
	}

	const safeWidth = Math.max(1, Math.floor(width));
	const safeHeight = Math.max(1, Math.floor(height));
	const sideScale = Math.min(1, maxSide / safeWidth, maxSide / safeHeight);
	const areaScale = Math.min(1, Math.sqrt(MAX_EXPORT_AREA / (safeWidth * safeHeight)));
	const scale = Math.min(sideScale, areaScale);

	return {
		width: Math.max(1, Math.floor(safeWidth * scale)),
		height: Math.max(1, Math.floor(safeHeight * scale))
	};
}

function isSecurityError(error: unknown): boolean {
	return error instanceof DOMException && error.name === 'SecurityError';
}

/**
 * Encodes a canvas into a `Blob`, translating a `null` result and `SecurityError` (tainted canvas)
 * into typed {@link ExportImageError}s.
 */
export function canvasToBlob(
	canvas: CanvasLike,
	format: ExportImageFormat,
	quality?: number
): Promise<Blob> {
	return new Promise<Blob>((resolve, reject) => {
		try {
			canvas.toBlob(
				blob => {
					if (blob === null) {
						reject(
							new ExportImageError(
								'blob-null',
								'Could not encode the image (the canvas appears to be empty).'
							)
						);

						return;
					}

					resolve(blob);
				},
				format,
				quality
			);
		} catch (error) {
			const security = isSecurityError(error);

			reject(
				new ExportImageError(
					security ? 'security-error' : 'encode-failed',
					security
						? 'Image export was blocked by cross-origin content (tainted canvas). Remove external textures or enable CORS.'
						: 'Could not encode the image.'
				)
			);
		}
	});
}

function sanitizeFileNamePart(value: string): string {
	const sanitized = value
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-')
		.replace(/^-+|-+$/g, '');

	return sanitized.length > 0 ? sanitized : 'view';
}

/**
 * Resolves the name of the active 3D viewport for a given editor layout: the perspective view is
 * shown alone in `singleView` (`ViewPanel`) and in the top-right pane of `fourViews` (`ViewPanel3D`).
 */
export function resolveActiveViewportName(layout: string | undefined): string {
	return layout === 'fourViews' ? 'ViewPanel3D' : 'ViewPanel';
}

/** Maps an internal viewport name to a short, filename-friendly token. */
export function viewNameToToken(viewName: string): string {
	switch (viewName) {
		case 'ViewPanel':
		case 'ViewPanel3D':
			return '3d';
		case 'ViewPanelXY':
			return 'xy';
		case 'ViewPanelY':
			return 'xz';
		case 'ViewPanelX':
			return 'yz';
		default:
			return sanitizeFileNamePart(viewName);
	}
}

/** Builds the default MVP file name: `yaptide-<view>-<YYYYMMDD-HHmmss>.png`. */
export function buildPngFilename(token: string, date: Date = new Date()): string {
	const pad = (value: number) => value.toString().padStart(2, '0');
	const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(
		date.getHours()
	)}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

	return `yaptide-${sanitizeFileNamePart(token)}-${stamp}.png`;
}

/** Characters that are illegal in file names on Windows/macOS/Linux. */
const ILLEGAL_FILENAME_CHARACTERS = /[\\/:*?"<>|]/g;

/**
 * Builds a safe PNG file name from raw user input: trims it, removes characters that are illegal in
 * file names on common platforms and guarantees the `.png` extension appears exactly once. When
 * nothing usable is left it falls back to {@link buildPngFilename}.
 */
export function sanitizeExportFileName(value: string, date: Date = new Date()): string {
	const withoutExtension = value.trim().replace(/\.png$/i, '');
	const sanitized = withoutExtension.replace(ILLEGAL_FILENAME_CHARACTERS, '').trim();

	return sanitized.length > 0 ? `${sanitized}.png` : buildPngFilename('view', date);
}

export interface ExportImageSelection {
	includeGrid: boolean;
	includeHelpers: boolean;
	geometryOnly: boolean;
}

/**
 * Translates the export dialog checkboxes into {@link ExportImageOptions}. The object-only switch
 * wins over the grid/helpers switches: such an export never draws the grid or any helper.
 */
export function buildExportImageOptions({
	includeGrid,
	includeHelpers,
	geometryOnly
}: ExportImageSelection): ExportImageOptions {
	if (geometryOnly) {
		return { geometryOnly: true, hideGrid: true, hideHelpers: true, format: 'image/png' };
	}

	return {
		geometryOnly: false,
		hideGrid: !includeGrid,
		hideHelpers: !includeHelpers,
		format: 'image/png'
	};
}
