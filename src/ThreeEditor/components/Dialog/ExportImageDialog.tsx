import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, FormEvent, useState } from 'react';

import { StoreContext } from '../../../services/StoreService';
import { saveBlob } from '../../../util/File';
import {
	buildPngFilename,
	sanitizeExportFileName,
	viewNameToToken
} from '../../js/viewport/ViewportExport';
import { ConcreteDialogProps, CustomDialog } from './CustomDialog';

export function ExportImageDialog({
	onClose,
	yaptideEditor
}: ConcreteDialogProps<Required<Pick<StoreContext, 'yaptideEditor'>>>) {
	const [fileName, setFileName] = useState(() =>
		buildPngFilename(
			viewNameToToken(yaptideEditor?.viewManager?.getActiveViewportName() ?? 'ViewPanel')
		)
	);
	const [includeGrid, setIncludeGrid] = useState(false);
	const [includeHelpers, setIncludeHelpers] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	const changeFileName = (event: ChangeEvent<HTMLInputElement>) => {
		setFileName(event.target.value);
	};

	const handleDownload = async () => {
		if (!yaptideEditor || isExporting) return;

		setIsExporting(true);

		try {
			const result = await yaptideEditor.viewManager.exportViewImage('active', {
				hideGrid: !includeGrid,
				hideHelpers: !includeHelpers,
				format: 'image/png'
			});

			saveBlob(result.blob, sanitizeExportFileName(fileName));
			enqueueSnackbar('View exported as PNG.', { variant: 'success' });
			onClose();
		} catch (error) {
			enqueueSnackbar(error instanceof Error ? error.message : 'Could not export the view.', {
				variant: 'error'
			});
		} finally {
			setIsExporting(false);
		}
	};

	// Pressing Enter in the form must not reload the page (implicit submit); it triggers the export.
	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		void handleDownload();
	};

	return (
		<CustomDialog
			onClose={onClose}
			title='Export view as PNG'
			contentText='The active 3D view will be exported as an opaque PNG file.'
			body={
				<form
					onSubmit={handleSubmit}
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: 15,
						paddingTop: 20
					}}>
					<TextField
						label='File name'
						value={fileName}
						variant='outlined'
						onChange={changeFileName}
					/>
					<FormControlLabel
						label='Include grid'
						sx={{
							'&.MuiFormControlLabel-root': { paddingLeft: 1 },
							'userSelect': 'none'
						}}
						control={
							<Checkbox
								checked={includeGrid}
								onChange={(_, checked) => setIncludeGrid(checked)}
							/>
						}
					/>
					<FormControlLabel
						label='Include helper objects (lights, cameras, selection)'
						sx={{
							'&.MuiFormControlLabel-root': { paddingLeft: 1 },
							'userSelect': 'none'
						}}
						control={
							<Checkbox
								checked={includeHelpers}
								onChange={(_, checked) => setIncludeHelpers(checked)}
							/>
						}
					/>
				</form>
			}>
			<Button
				color='secondary'
				onClick={onClose}>
				Cancel
			</Button>
			<Button
				color='secondary'
				variant='contained'
				disabled={isExporting}
				onClick={handleDownload}>
				Download
			</Button>
		</CustomDialog>
	);
}
