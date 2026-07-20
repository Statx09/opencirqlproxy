import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ERROR:", error);
    console.error("COMPONENT STACK:", info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 30,
            color: "white",
            background: "#111",
            whiteSpace: "pre-wrap",
          }}
        >
          {String(this.state.error)}
        </div>
      );
    }

    return this.props.children;
  }
}