/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import { withStyles } from 'material-ui/styles';
import Tabs, { Tab } from 'material-ui/Tabs';
import type { Body, BodyGeometry, ConstructionPath } from 'model/simulation/zone';
import BodyEditorContainer from './BodyEditorContainer';
import selector from '../../selector';

type Props = {
  isModalOpen: ?bool,
  closeModal: () => void,
  constructionPath: ConstructionPath,
  body: Body,
  classes: Object,
};

type State = {
  route: 'create' | 'select',
  bodyGeometry: BodyGeometry | {},
};

class BodyEditorModal extends React.Component<Props, State> {
  props: Props;
  state: State = {
    route: 'create',
    bodyGeometry: {},
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
    this.setState({
      bodyGeometry: (props.body.id !== undefined ? props.body.geometry : {
        type: undefined,
      }),
    });
  }

  onRouteChanged = (event:any, route: 'create' | 'select') => {
    this.setState({ route });
  }

  setGeometry = (geometryUpdate: BodyGeometry) => {
    this.setState({ bodyGeometry: geometryUpdate });
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
          <Tab label="Body creator" value="create" className={classes.tabItem} />
          <Tab label="Select existing body" value="select" className={classes.tabItem} />
        </Tabs>
        {
          this.state.route === 'create'
            ? <BodyEditorContainer
              bodyGeometry={this.state.bodyGeometry}
              setGeometry={this.setGeometry}
              constructionPath={this.props.constructionPath}
              bodyId={this.props.body.id}
              closeModal={this.props.closeModal}
              classes={{ root: classes.editorRoot }}
            />
            : null
        }
      </Dialog>
    ) : null;
  }
}

const styles = (theme: Object) => ({
  root: {
    minWidth: 720,
    minHeight: 480,
  },
  editorRoot: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tabItem: {
    flex: '1 1 0',
    maxWidth: theme.breakpoints.values.md,
  },
});

const mapStateToProps = (state, props) => {
  return {
    body: selector.bodyByConstructionPath(state, props.constructionPath).toJS(),
  };
};

export default connect(
  mapStateToProps,
)(withStyles(styles)(BodyEditorModal));
