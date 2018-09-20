// @flow
import React from 'react';

type Props = {
  initialState: any,
  handlers: any,
  componentDidMount?: () => void,
  componentWillUpdate?: () => void,
  componentWillUnmount?: () => void,
  children?: React.Node,
};

class Component extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = props.initialState || {};
    this.handlers = (
      Object.keys(props.handlers || {})
        .reduce(
          (
            handlers,
            handlerName,
          ) => ({
            ...handlers,
            [handlerName]: args => (
              props.handlers[handlerName]({
                props: this.props,
                state: this.state,
                setState: this.setState.bind(this),
                getState: () => this.state,
                ref: this.component,
                handlers,
              })(args)
            ),
          }),
          {},
        )
    );
  }

  componentDidMount() {
    const { componentDidMount } = this.props;
    if (componentDidMount) {
      componentDidMount({
        props: this.props,
        state: this.state,
        setState: this.setState.bind(this),
        ref: this.component,
      });
    }
  }

  componentWillUpdate(nextProps, nextState) {
    const { componentWillUpdate } = this.props;
    if (componentWillUpdate) {
      componentWillUpdate(nextProps, nextState);
    }
  }

  componentWillUnmount() {
    const { componentWillUnmount } = this.props;
    if (componentWillUnmount) {
      componentWillUnmount(this.props);
    }
  }

  getRenderedComponent() {
    return this.component;
  }

  render() {
    const { children } = this.props;
    return children(
      this.props,
      {
        handlers: this.handlers,
        setState: (updater, callback) => (
          this.setState(updater, callback)
        ),
        state: this.state,
        ref: el => this.component = el, // eslint-disable-line
      },
    );
  }
}

Component.defaultProps = {
  componentDidMount: null,
  componentWillUpdate: null,
  componentWillUnmount: null,
  children: null,
};

export default Component;
