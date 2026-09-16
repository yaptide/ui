import { redraw, resize, settings } from 'jsroot';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVisible } from 'react-hooks-visible';
import { throttle } from 'throttle-debounce';
import { useResizeObserver } from 'usehooks-ts';

type AxisRange = { xmin: number; xmax: number; ymin: number; ymax: number };

export const useJsRootCanvas = (redrawParam: string) => {
	// Custom react hook, visible contains the percentage of the containterEl
	// that is currently visible on screen
	const [containerEl, visible] = useVisible<HTMLDivElement>();
	const [obj, setObj] = useState<Object | undefined>(undefined);
	const [drawn, setDrawn] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const visibleRef = useRef(isVisible);
	const painterRef = useRef<any>(null);
	const initialRangeRef = useRef<AxisRange | null>(null);
	const { width: resizeWidth, height: resizeHeight } = useResizeObserver({
		ref: containerEl as React.RefObject<HTMLDivElement>
	});

	useEffect(() => {
		// Update isVisible if more than 30% of containerEl is visible
		setIsVisible(visible > 0.3);

		return () => setIsVisible(false);
	}, [visible]);

	// Update visibleRef when isVisible changes
	useEffect(() => {
		visibleRef.current = isVisible;
	}, [isVisible]);

	useEffect(() => {
		if (obj && !drawn) {
			// by default, the graph is draggable, so we disable it
			settings.DragGraphs = false;
			// prevent accidental plot zooming while scrolling the results panel
			settings.ZoomWheel = false;
			// enable context menu on right click
			settings.ContextMenu = true;
			// enable toolbar in the lower left corner
			settings.ToolBar = true;
			// disable statistics box
			settings.AutoStat = false;
			// redraw plot

			initialRangeRef.current = null;

			redraw(containerEl.current, obj, redrawParam).then((painter: any) => {
				painterRef.current = painter;

				const fp = painter?.getFramePainter?.();

				if (fp && !initialRangeRef.current) {
					initialRangeRef.current = {
						xmin: fp.scale_xmin,
						xmax: fp.scale_xmax,
						ymin: fp.scale_ymin,
						ymax: fp.scale_ymax
					};
				}
			});
			setDrawn(true);
		}
	}, [containerEl, drawn, obj, redrawParam]);

	const resizeHandler = useCallback(() => {
		if (visibleRef.current) resize(containerEl.current);
	}, [containerEl]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedResizeHandler = useCallback(
		throttle(300, resizeHandler, { noTrailing: false }),
		[resizeHandler]
	);

	useEffect(() => {
		if (visible) debouncedResizeHandler();
	}, [debouncedResizeHandler, resizeHeight, resizeWidth, visible]);

	const update = useCallback(
		(updateObject: () => Object) => {
			if (!isVisible) return;

			setDrawn(old => {
				const obj = updateObject();

				if (!obj) return old;
				setObj(obj);

				return false;
			});
		},
		[isVisible]
	);

	const setObjToDraw = useCallback(
		(obj: any) => {
			setObj(obj);

			setDrawn(false);
		},
		[setObj, setDrawn]
	);

	const resetZoom = useCallback(() => {
		const fp = painterRef.current?.getFramePainter?.();
		const range = initialRangeRef.current;

		if (fp && range) {
			void fp.zoom(range.xmin, range.xmax, range.ymin, range.ymax);
		} else {
			void fp?.unzoom('xyz');
		}
	}, []);

	const ref = useMemo(() => {
		return containerEl;
	}, [containerEl]);

	return {
		isVisible,
		setObjToDraw,
		drawn,
		update,
		resetZoom,
		ref
	};
};

export const GraphCanvas = forwardRef<HTMLDivElement>((_props: {}, ref) => {
	return (
		<div
			style={{
				width: '100%',
				height: 500
			}}
			ref={ref}></div>
	);
});
