/* @flow */

import React from 'react';
import { RowLabel, FormSelect } from 'components/Form';
import { t } from 'i18n';
import Style from 'styles';
import type { GeometryType } from 'model/simulation/body';

type Props = {
  type: GeometryType,
  onTypeChange: (type: GeometryType) => void,
  children?: any,
}

class GeometryForm extends React.Component<Props> {
  props: Props

  render() {
    return (
      <div style={styles.form}>
        <RowLabel
          label={t('workspace.editor.type')}
        >
          <FormSelect
            value={this.props.type}
            onChange={this.props.onTypeChange}
            options={options}
            fullWidth
          />
        </RowLabel>
        {this.props.children}
      </div>
    );
  }
}

const options = [
  { field: 'cuboid', label: t('workspace.typeLabel.cuboid') },
  { field: 'sphere', label: t('workspace.typeLabel.sphere') },
  { field: 'cylinder', label: t('workspace.typeLabel.cylinder') },
];

const styles = {
  form: {
    paddingTop: Style.Dimens.spacing.normal,
    flex: '1 0 0',
  },
};

export default GeometryForm;
