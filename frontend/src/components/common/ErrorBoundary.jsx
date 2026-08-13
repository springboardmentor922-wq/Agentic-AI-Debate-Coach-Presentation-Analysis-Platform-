import React from "react";
import { FaExclamationTriangle, FaRedo } from "react-icons/fa";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught a runtime error:", error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-fallback">
                    <div className="error-card">
                        <FaExclamationTriangle className="error-icon" />
                        <h2>Something went wrong</h2>
                        <p>{this.state.error?.message || "A runtime error occurred in this view."}</p>
                        <button type="button" className="reload-btn" onClick={this.handleReload}>
                            <FaRedo /> Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
