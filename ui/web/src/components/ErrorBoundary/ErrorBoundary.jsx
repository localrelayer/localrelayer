// @flow
import React from 'react';
import * as S from './styled';

class ErrorBoundary extends React.Component<Props> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch() {
    this.setState({ hasError: true });
  }

  render() {
    const {
      componentKey,
      children,
    } = this.props;
    const { hasError } = this.state;
    if (hasError) {
      return (
        <S.ErrorBoundary componentKey={componentKey}>
          <S.Header>
            This component failed :(
          </S.Header>
          <S.AdditionalInfo>
            You can try to reload page
          </S.AdditionalInfo>
          <S.ButtonWrapper>
            <S.ReloadButton type="primary" onClick={() => window.location.reload()}>
              Reload
            </S.ReloadButton>
          </S.ButtonWrapper>
        </S.ErrorBoundary>
      );
    }
    return children;
  }
}

export default ErrorBoundary;
