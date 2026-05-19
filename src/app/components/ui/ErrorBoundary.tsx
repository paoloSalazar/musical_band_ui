/** Error Boundary component for React class-based error handling */
import React from 'react';

type Props = {
  children?: React.ReactNode;
};
type State = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any): State {
    return { hasError: true };
  }

  componentDidCatch(_error: any, _info: any) {
    // Log error if needed
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-600">Something went wrong.</div>
      );
    }
    return <>{this.props.children}</>;
  }
}

export default ErrorBoundary;
