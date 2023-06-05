import { LegacyRef, forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { useVisible } from 'react-hooks-visible';
import { useElementSize } from 'usehooks-ts';
import { useJSROOT } from '../../services/JsRootService';
import { throttle } from 'throttle-debounce';
import { mergeRefs } from 'react-merge-refs';
import Skeleton from '@mui/material/Skeleton';

export const useJsRootCanvas = (redrawParam: string) => {
	const { JSROOT } = useJSROOT();
	const [resizeRef, { width: resizeWidth, height: resizeHeight }] = useElementSize();
	// Custom react hook, visible contains the percentage of the containterEl
	// that is currently visible on screen
	const [containerEl, visible] = useVisible<HTMLDivElement>();

	const [obj, setObj] = useState(undefined);
	const [drawn, setDrawn] = useState(false);
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Update isVisible if more than 30% of containerEl is visible
		setIsVisible(visible > 0.3);
		return () => setIsVisible(false);
	}, [visible]);

	useEffect(() => {
		if (obj && !drawn) {
			JSROOT.redraw(containerEl.current, obj, redrawParam);
			setDrawn(true);
		}
	}, [JSROOT, containerEl, drawn, obj, redrawParam]);

	const resizeHandler = useCallback(() => {
		if (isVisible) JSROOT.resize(containerEl.current);
	}, [JSROOT, containerEl, isVisible]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const debouncedResizeHandler = useCallback(
		throttle(300, resizeHandler, { noTrailing: false }),
		[resizeHandler]
	);

	useEffect(() => {
		debouncedResizeHandler();
	}, [debouncedResizeHandler, resizeHeight, resizeWidth]);

	const setObjToDraw = useCallback(
		(obj: any) => {
			setObj(obj);
			setDrawn(false);
		},
		[setObj, setDrawn]
	);

	const ref = useMemo(() => mergeRefs([resizeRef, containerEl]), [resizeRef, containerEl]);

	return {
		JSROOT,
		isVisible,
		setObjToDraw,
		drawn,
		ref
	};
};

interface GraphCanvasProps {
	drawn: boolean;
}

export const GraphCanvas = forwardRef<HTMLDivElement, GraphCanvasProps>(
	(props: GraphCanvasProps, ref) => {
		return (
			<div
				style={{
					width: '100%',
					height: 500
				}}
				ref={ref}>
				<Skeleton
					hidden={props.drawn}
					variant='rectangular'
					width={'80%'}
					height={'80%'}
				/>
			</div>
		);
	}
);
