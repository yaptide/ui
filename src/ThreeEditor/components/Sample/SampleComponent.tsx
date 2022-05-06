import React, { useCallback, useEffect, useState } from 'react';
import { Signal } from 'signals';
import './SampleComponent.css';

interface SampleComponentProps {
	signal: Signal;
}

function SampleComponent({ signal }: SampleComponentProps) {
	const [objectName, setObjectName] = useState();
	const [objectID, setObjectID] = useState();

	const objectSelected = useCallback(
		(object: {
			name: React.SetStateAction<undefined>;
			id: React.SetStateAction<undefined>;
		}) => {
			setObjectName(object?.name);
			setObjectID(object?.id);
		},
		[]
	);

	useEffect(() => {
		signal.add(objectSelected);
		return () => {
			signal.remove(objectSelected);
		};
	}, [objectSelected, signal]);

	return (
		<div className='SampleComponent'>
			Selected Name:{objectName}
			<br></br>
			Selected ID:{objectID}
		</div>
	);
}

export default SampleComponent;
