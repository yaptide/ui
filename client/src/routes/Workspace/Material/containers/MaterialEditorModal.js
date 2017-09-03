/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import { withStyles } from 'material-ui/styles';
import Tabs, { Tab } from 'material-ui/Tabs';
import type { Material } from 'model/simulation/material';
import PredefinedMaterialEditorContainer from './PredefinedMaterialEditorContainer';
import CompoundMaterialEditorContainer from './CompoundMaterialEditorContainer';
import VoxelMaterialEditorContainer from './VoxelMaterialEditorContainer';
import selector from '../../selector';

type Props = {
  isModalOpen: ?bool,
  materialId?: number,
  material: Material,
  closeModal: () => void,
  classes: Object,
};

type State = {
  route: 'predefined' | 'compound' | 'voxel',
};

class MaterialEditorModal extends React.Component<Props, State> {
  props: Props;
  state: State = {
    route: 'predefined',
  };


  componentWillMount() {
    this.updateState(this.props);
  }

  componentWillReceiveProps(newProps: Props) {
    if (this.props.isModalOpen !== newProps.isModalOpen) {
      this.updateState(newProps);
    }
  }

  updateState = (props: Props) => {
    if (props.material && props.material.materialInfo && props.material.materialInfo.type) {
      this.setState({ route: props.material.materialInfo.type });
    } else {
      this.setState({ route: 'predefined' });
    }
  }

  onRouteChanged = (event: any, route: 'predefined' | 'compound' | 'voxel') => {
    this.setState({ route });
  }

  render() {
    const classes = this.props.classes;
    return this.props.isModalOpen ? (
      <Dialog
        open={this.props.isModalOpen}
        onRequestClose={this.props.closeModal}
        classes={{ paper: classes.root }}
      >
        <Tabs
          value={this.state.route}
          onChange={this.onRouteChanged}
          indicatorColor="primary"
          textColor="primary"
          fullWidth
          classes={{ flexContainer: classes.tabsContainer }}
        >
          <Tab label="Predefined" value="predefined" className={classes.tabItem} />
          <Tab label="Compound" value="compound" className={classes.tabItem} />
          <Tab label="Voxel" value="voxel" className={classes.tabItem} />
        </Tabs>
        {
          this.state.route === 'predefined' &&
            <PredefinedMaterialEditorContainer
              materialId={this.props.materialId}
              closeModal={this.props.closeModal}
              classes={{ root: classes.editorRoot }}
            />
        }
        {
          this.state.route === 'compound' &&
            <CompoundMaterialEditorContainer
              materialId={this.props.materialId}
              closeModal={this.props.closeModal}
              classes={{ root: classes.editorRoot }}
            />
        }
        {
          this.state.route === 'voxel' &&
            <VoxelMaterialEditorContainer
              materialId={this.props.materialId}
              closeModal={this.props.closeModal}
              classes={{ root: classes.editorRoot }}
            />
        }
      </Dialog>
    ) : null;
  }
}

const styles = (theme: Object) => ({
  root: {
    width: '80%',
    height: '90%',
    maxWidth: 'none',
  },
  editorRoot: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    height: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tabItem: {
    flex: '1 1 0',
    maxWidth: theme.breakpoints.values[2],
  },
});

const mapStateToProps = (state, props) => {
  return {
    material: selector.materialById(state, props.materialId).toJS(),
  };
};

export default connect(
  mapStateToProps,
)(withStyles(styles)(MaterialEditorModal));
