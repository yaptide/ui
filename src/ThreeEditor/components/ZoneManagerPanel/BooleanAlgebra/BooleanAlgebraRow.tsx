import { Box, Divider } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { Object3D } from 'three';
import { Operation, OperationData, OperationDataList } from '../../../util/Operation';
import { GeometryLabel } from './GeometryLabel';
import OperationToggle from './OperationToggle';

type BooleanAlgebraRowProps = {
	onGeometryClick: (index: number) => (event: React.MouseEvent<HTMLElement>) => void;
	onOperationChange: (
		valueIndex: number
	) => (event: React.MouseEvent<HTMLElement>, value?: string | null) => void;
	value: OperationDataList;
	allObjects: Object3D[];
};

export type AlgebraRow = {
	geometriesId: (number | null)[];
	operations: (Operation | null)[];
};

export default function BooleanAlgebraRow({
	value,
	onGeometryClick,
	onOperationChange,
	allObjects
}: BooleanAlgebraRowProps) {
	const displayValueRef = useRef<Partial<OperationData>[]>([...value]);
	const [lastObj, setLastObj] = useState<Partial<OperationData>>(
		{} //This start values ensures so that list will scroll down to the end on first open
	);
	const [lastLength, setLastLength] = useState<number>(value.length);
	useEffect(() => {
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
	}, [value]);

	const endRef = React.useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		setTimeout(() => {
			endRef.current?.scrollIntoView({ behavior: 'smooth' });
		}, 1);
	};

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
											'height': '24px',
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
