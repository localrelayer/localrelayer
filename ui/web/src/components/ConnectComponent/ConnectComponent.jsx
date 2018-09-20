// @flow
import {
  connect,
} from 'react-redux';

import Component from '../Component';


export default connect(
  (state, { mapStateToProps, ...props }) => (
    mapStateToProps ? mapStateToProps(state, props) : {}
  ),
  dispatch => ({
    dispatch,
  }),
)(Component);
