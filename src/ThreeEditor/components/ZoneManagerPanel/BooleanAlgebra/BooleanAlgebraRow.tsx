import { Box, Divider } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { Object3D } from 'three';
import { Operation, OperationData, OperationDataList } from '../../../util/Operation';
import { GeometryLabel } from './GeometryLabel';
import OperationToggle from './OperationToggle';

export type BooleanAlgebraRowProps = {
	onGeometryClick: (index: number) => (event: React.MouseEvent<HTMLElement>) => void;
	onOperationChange: (
		valueIndex: number
	) => (event: React.MouseEvent<HTMLElement>, value?: string | null) => void;
	value: OperationDataList;
	allObjects: Object3D[];
	scrollWrapperRef: React.MutableRefObject<HTMLDivElement | null>;
};

export type AlgebraRow = {
	geometriesId: (number | null)[];
	operations: (Operation | null)[];
};

export default function BooleanAlgebraRow({
	value,
	onGeometryClick,
	onOperationChange,
	allObjects,
	scrollWrapperRef
}: BooleanAlgebraRowProps) {
	const displayValueRef = useRef<Partial<OperationData>[]>([...value]);
	const [lastObj, setLastObj] = useState<Partial<OperationData>>(
		{} //This start values ensures so that list will scroll down to the end on first open
	);
	const [lastLength, setLastLength] = useState<number>(value.length);
	useEffect(() => {
		const scrollToBottom = () => {
			// scroll to bottom using scrollTop function on scrollWrapperRef and offsetTop of endRef
			if (scrollWrapperRef)
				setTimeout(() => {
					scrollWrapperRef.current?.scrollTo({
						top: endRef.current?.offsetTop,
						behavior: 'smooth'
					});
				}, 1);
		};

		displayValueRef.current = [...value];
		// if the last object is defined, add ui to create a new one
		if (value.length === 0 || value[value.length - 1].objectId !== null)
			displayValueRef.current[displayValueRef.current.length] = {
				operation: displayValueRef.current.length === 0 ? 'union' : undefined,
				objectId: undefined
			};
		const lastRef = displayValueRef.current[displayValueRef.current.length - 1];
		if (
			lastObj?.objectId !== lastRef?.objectId ||
			lastObj?.objectId !== lastRef?.objectId ||
			lastLength !== displayValueRef.current.length
		) {
			scrollToBottom();
		}
		setLastObj(Object.assign({}, lastRef));
		setLastLength(displayValueRef.current.length);
	}, [value, lastObj?.objectId, lastLength, scrollWrapperRef]);

	const endRef = React.useRef<HTMLDivElement>(null);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				marginTop: '-36px',
				paddingTop: '12px',
				position: 'relative',
				height: '100%'
			}}>
			{displayValueRef.current.map(
				({ operation, objectId }: Partial<OperationData>, index) => {
					const referencedObject = allObjects.find(obj => obj.id === objectId);
					const label = referencedObject?.name;
					const tooltipId = Number(referencedObject?.id).toString();
					return (
						<Box
							key={index}
							sx={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'stretch'
							}}>
							{index > 0 && (
								<>
									<Divider
										orientation='vertical'
										sx={{
											'width': '1px',
											'overflow': 'visible',
											'height': index === value.length - 1 ? '44px' : '24px',
											'backgroundColor': 'primary.main',
											'margin': '0 auto',
											'position': 'relative',
											'&:after': {
												// triangle
												content: '""',
												position: 'absolute',
												bottom: '-5px',
												left: '-4px',
												border: '5px solid transparent',
												borderTopColor: 'primary.main'
											}
										}}
									/>
									<OperationToggle
										onChange={onOperationChange(index)}
										canClear={index === value.length - 1}
										value={operation}
										objectName={label}
									/>
								</>
							)}
							{operation && (
								<GeometryLabel
									onClick={onGeometryClick(index)}
									label={label}
									tooltipId={tooltipId}
								/>
							)}
						</Box>
					);
				}
			)}
			<div
				ref={endRef}
				style={{
					padding: '12px'
				}}
			/>
		</Box>
	);
}
