import { MathUtils, Object3D } from 'three';
import { Editor } from '../../../../js/Editor';
import { PropertyField, RulesConfiguration, RulesOutliner } from '../fields/PropertyField';
import { useSmartWatchEditorState } from '../../../../util/hooks/signals';
import { PropertiesCategory } from './PropertiesCategory';
import { Button } from '@mui/material';
import { DetectFilter, isDetectFilter } from '../../../../util/Detect/DetectFilter';
import { Keyword, RULE_DEFAULTS } from '../../../../util/Detect/DetectRuleTypes';
import { SetFilterRuleCommand } from '../../../../js/commands/SetFilterRuleCommand';
import { SetValueCommand } from '../../../../js/commands/SetValueCommand';

export function FilterConfiguration(props: { editor: Editor; object: Object3D }) {
	const { object, editor } = props;

	const { state: watchedObject } = useSmartWatchEditorState(editor, object as DetectFilter);

	const visibleFlag = isDetectFilter(watchedObject);

	return (
		<PropertiesCategory category='Differential Scoring' visible={visibleFlag}>
			{visibleFlag && (
				<>
					<PropertyField
						field={
							<Button
								sx={{ width: '100%' }}
								variant='contained'
								onClick={() => {
									const ruleJson = {
										uuid: MathUtils.generateUUID(),
										keyword: 'Z',
										operator: RULE_DEFAULTS.Z[0],
										value: RULE_DEFAULTS.Z[1]
									};
									editor.execute(
										new SetFilterRuleCommand(
											editor,
											watchedObject.object,
											ruleJson
										)
									);
								}}>
								Add rule
							</Button>
						}
					/>
					<PropertyField
						field={
							<RulesOutliner
								editor={editor}
								value={watchedObject.selectedRule?.uuid ?? null}
								options={watchedObject.rules}
								onChange={uuid => {
									const rule = watchedObject.getRuleByUuid(uuid);
									editor.execute(
										new SetValueCommand(
											editor,
											watchedObject.object,
											'selectedRule',
											rule
										)
									);
								}}
							/>
						}
					/>
					{watchedObject.selectedRule && (
						<PropertyField
							field={
								<RulesConfiguration
									rule={watchedObject.selectedRule}
									onChange={(newValue: {
										keywordSelect: string;
										operatorSelect: string;
										idSelect: string;
										valueInput: number;
									}) => {
										if (!watchedObject.selectedRule) return;
										const uuid = watchedObject.selectedRule.uuid;
										const keyword = newValue.keywordSelect as Keyword;
										const operator =
											keyword !== watchedObject.selectedRule.keyword
												? RULE_DEFAULTS[keyword][0]
												: newValue.operatorSelect;
										const value =
											keyword !== watchedObject.selectedRule.keyword
												? RULE_DEFAULTS[keyword][1]
												: newValue.valueInput;
										editor.execute(
											new SetFilterRuleCommand(editor, watchedObject.object, {
												uuid,
												keyword,
												operator,
												value
											})
										);
									}}
									onDelete={() =>
										editor.execute(
											new SetFilterRuleCommand(editor, watchedObject.object)
										)
									}
								/>
							}
						/>
					)}
				</>
			)}
		</PropertiesCategory>
	);
}
