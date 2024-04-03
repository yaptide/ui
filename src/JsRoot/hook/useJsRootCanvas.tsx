import { redraw, resize } from 'jsroot';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useVisible } from 'react-hooks-visible';
import { throttle } from 'throttle-debounce';
import { useResizeObserver } from 'usehooks-ts';

export const useJsRootCanvas = (redrawParam: string) => {
	// Custom react hook, visible contains the percentage of the containterEl
	// that is currently visible on screen
	const [containerEl, visible] = useVisible<HTMLDivElement>();
	const [obj, setObj] = useState<Object | undefined>(undefined);
	const [drawn, setDrawn] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const visibleRef = useRef(isVisible);
	const { width: resizeWidth, height: resizeHeight } = useResizeObserver({
		ref: containerEl
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
			redraw(containerEl.current, obj, redrawParam);
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

			setDrawn(() => {
				const obj = updateObject();
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

	const ref = useMemo(() => {
		return containerEl;
	}, [containerEl]);

	return {
		isVisible,
		setObjToDraw,
		drawn,
		update,
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
