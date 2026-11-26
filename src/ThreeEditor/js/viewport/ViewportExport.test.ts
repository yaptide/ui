import type { CanvasLike, ExportImageErrorCode } from './ViewportExport';
import {
	buildExportImageOptions,
	buildPngFilename,
	canvasToBlob,
	clampExportSize,
	ExportImageError,
	getMaxExportSide,
	MAX_EXPORT_AREA,
	MAX_EXPORT_SIDE,
	resolveActiveViewportName,
	sanitizeExportFileName,
	viewNameToToken
} from './ViewportExport';

const canvasThatResolves = (blob: Blob | null): CanvasLike => ({
	toBlob: callback => callback(blob)
});

const canvasThatThrows = (error: unknown): CanvasLike => ({
	toBlob: () => {
		throw error;
	}
});

const expectExportError = (promise: Promise<unknown>, code: ExportImageErrorCode) =>
	expect(promise).rejects.toMatchObject({ name: 'ExportImageError', code });

describe('getMaxExportSide', () => {
	test('caps the GPU limit at MAX_EXPORT_SIDE', () => {
		expect(getMaxExportSide(16384)).toBe(MAX_EXPORT_SIDE);
	});

	test('uses a lower reported limit', () => {
		expect(getMaxExportSide(4096)).toBe(4096);
	});

	test('falls back to MAX_EXPORT_SIDE for invalid input', () => {
		expect(getMaxExportSide(undefined)).toBe(MAX_EXPORT_SIDE);
		expect(getMaxExportSide(Number.NaN)).toBe(MAX_EXPORT_SIDE);
		expect(getMaxExportSide(0)).toBe(MAX_EXPORT_SIDE);
	});
});

describe('clampExportSize', () => {
	test('leaves a size that already fits unchanged', () => {
		expect(clampExportSize(800, 600, MAX_EXPORT_SIDE)).toEqual({ width: 800, height: 600 });
	});

	test('clamps the longest side and preserves aspect ratio', () => {
		const { width, height } = clampExportSize(16000, 2000, MAX_EXPORT_SIDE);
		expect(width).toBe(MAX_EXPORT_SIDE);
		expect(height).toBe(1024);
	});

	test('enforces the total-area limit', () => {
		const { width, height } = clampExportSize(8000, 8000, MAX_EXPORT_SIDE);
		expect(width * height).toBeLessThanOrEqual(MAX_EXPORT_AREA);
	});

	test('rejects non-finite and non-positive sizes', () => {
		expect(() => clampExportSize(Number.NaN, 100, MAX_EXPORT_SIDE)).toThrow(ExportImageError);
		expect(() => clampExportSize(100, Number.POSITIVE_INFINITY, MAX_EXPORT_SIDE)).toThrow(
			ExportImageError
		);
		expect(() => clampExportSize(0, 100, MAX_EXPORT_SIDE)).toThrow(ExportImageError);
		expect(() => clampExportSize(100, -1, MAX_EXPORT_SIDE)).toThrow(ExportImageError);
	});

	test('tags invalid sizes with the canvas-limit code', () => {
		let caught: unknown;

		try {
			clampExportSize(0, 0, MAX_EXPORT_SIDE);
		} catch (error) {
			caught = error;
		}

		expect(caught).toBeInstanceOf(ExportImageError);
		expect((caught as ExportImageError).code).toBe('canvas-limit');
	});
});

describe('canvasToBlob', () => {
	test('resolves with the produced blob', async () => {
		const blob = new Blob(['image/png']);

		await expect(canvasToBlob(canvasThatResolves(blob), 'image/png')).resolves.toBe(blob);
	});

	test('rejects with blob-null when the canvas cannot be encoded', async () => {
		await expectExportError(canvasToBlob(canvasThatResolves(null), 'image/png'), 'blob-null');
	});

	test('rejects with security-error for a tainted canvas', async () => {
		const error = new DOMException('tainted', 'SecurityError');

		await expectExportError(
			canvasToBlob(canvasThatThrows(error), 'image/png'),
			'security-error'
		);
	});

	test('rejects with encode-failed for unknown errors', async () => {
		await expectExportError(
			canvasToBlob(canvasThatThrows(new Error('boom')), 'image/png'),
			'encode-failed'
		);
	});

	test('rejects with a typed ExportImageError', async () => {
		await expect(canvasToBlob(canvasThatResolves(null), 'image/png')).rejects.toBeInstanceOf(
			ExportImageError
		);
	});
});

describe('resolveActiveViewportName', () => {
	test('returns the perspective view name for both layouts', () => {
		expect(resolveActiveViewportName('singleView')).toBe('ViewPanel');
		expect(resolveActiveViewportName('fourViews')).toBe('ViewPanel3D');
	});

	test('falls back to the single view name for unknown layouts', () => {
		expect(resolveActiveViewportName(undefined)).toBe('ViewPanel');
		expect(resolveActiveViewportName('nonsense')).toBe('ViewPanel');
	});
});

describe('viewNameToToken', () => {
	test('maps the 3D viewport names to 3d', () => {
		expect(viewNameToToken('ViewPanel')).toBe('3d');
		expect(viewNameToToken('ViewPanel3D')).toBe('3d');
	});

	test('maps remaining viewports and sanitizes unknown names', () => {
		expect(viewNameToToken('ViewPanelXY')).toBe('xy');
		expect(viewNameToToken('Weird Name!')).toBe('weird-name');
	});
});

describe('buildPngFilename', () => {
	test('uses the yaptide-<view>-<timestamp>.png pattern', () => {
		expect(buildPngFilename('3d', new Date(2026, 2, 4, 5, 6, 7))).toBe(
			'yaptide-3d-20260304-050607.png'
		);
	});

	test('sanitizes the token', () => {
		expect(buildPngFilename('My View', new Date(2026, 2, 4, 5, 6, 7))).toBe(
			'yaptide-my-view-20260304-050607.png'
		);
	});
});

describe('sanitizeExportFileName', () => {
	const date = new Date(2026, 2, 4, 5, 6, 7);

	test('trims whitespace and appends the .png extension', () => {
		expect(sanitizeExportFileName('  my view  ', date)).toBe('my view.png');
	});

	test('removes characters that are illegal in file names', () => {
		expect(sanitizeExportFileName('a/b\\c:d*e?f"g<h>i|j', date)).toBe('abcdefghij.png');
	});

	test('does not duplicate an existing .png extension', () => {
		expect(sanitizeExportFileName('shot.png', date)).toBe('shot.png');
		expect(sanitizeExportFileName('shot.PNG', date)).toBe('shot.png');
	});

	test('falls back to the default name when nothing usable is left', () => {
		expect(sanitizeExportFileName('   ', date)).toBe('yaptide-view-20260304-050607.png');
		expect(sanitizeExportFileName('///', date)).toBe('yaptide-view-20260304-050607.png');
		expect(sanitizeExportFileName('.png', date)).toBe('yaptide-view-20260304-050607.png');
	});
});

describe('buildExportImageOptions', () => {
	test('object-only wins over the grid/helpers switches', () => {
		expect(
			buildExportImageOptions({ includeGrid: true, includeHelpers: true, geometryOnly: true })
		).toEqual({ geometryOnly: true, hideGrid: true, hideHelpers: true, format: 'image/png' });
	});

	test('maps the grid/helpers switches when object-only is off', () => {
		expect(
			buildExportImageOptions({
				includeGrid: false,
				includeHelpers: false,
				geometryOnly: false
			})
		).toEqual({ geometryOnly: false, hideGrid: true, hideHelpers: true, format: 'image/png' });

		expect(
			buildExportImageOptions({
				includeGrid: true,
				includeHelpers: true,
				geometryOnly: false
			})
		).toEqual({
			geometryOnly: false,
			hideGrid: false,
			hideHelpers: false,
			format: 'image/png'
		});
	});
});
