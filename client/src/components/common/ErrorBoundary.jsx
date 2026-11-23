import React from 'react';
import './ErrorBoundary.css';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Intentionally no stack traces in the UI.
  }

  handleReload = () => {
    this.setState({ hasError: false });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
      return;
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-boundary" role="alert">
          <div className="app-error-card">
            <p className="app-error-kicker">St. Britto Higher Secondary School</p>
            <h1>This page could not be displayed</h1>
            <p>
              Something went wrong while loading this screen. Your work on other pages is unaffected.
              Please reload and try again.
            </p>
            <button type="button" className="app-error-reload" onClick={this.handleReload}>
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
