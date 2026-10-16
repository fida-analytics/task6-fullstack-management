
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("React component error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-shell">
          <section className="task-card">
            <h1>Oops! Something went wrong.</h1>
            <p>
              Maazrat, page display karte waqt masla aa gaya.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Reload page
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
