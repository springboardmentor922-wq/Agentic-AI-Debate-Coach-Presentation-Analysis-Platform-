import { Component } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] caught render error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="
            flex
            min-h-screen
            flex-col
            items-center
            justify-center
            gap-4
            bg-gradient-to-br
            from-blue-500/5
            via-indigo-500/5
            to-violet-500/10
            px-6
            text-center

            dark:from-blue-500/10
            dark:via-indigo-500/10
            dark:to-violet-500/15
          "
        >
          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-blue-500
              via-indigo-500
              to-violet-500
              text-white
              shadow-lg
              shadow-blue-500/20
            "
          >
            <AlertTriangle size={32} />
          </div>

          <h1
            className="
              font-display
              text-xl
              font-bold
              text-ink-900
              dark:text-white
            "
          >
            Something went wrong
          </h1>

          <p className="max-w-md text-sm text-ink-900/60 dark:text-white/60">
            This page hit an unexpected error and couldn't continue. This has
            been logged — you can head back to the dashboard and try again.
          </p>

          {this.state.error?.message && (
            <p
              className="
                max-w-md
                rounded-xl
                border
                border-blue-500/10
                bg-blue-500/5
                px-4
                py-2
                font-mono
                text-xs
                text-ink-900/50

                dark:border-violet-400/10
                dark:bg-white/5
                dark:text-white/50
              "
            >
              {this.state.error.message}
            </p>
          )}

          <button
            type="button"
            onClick={this.handleReset}
            className="
              mt-2
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              via-indigo-600
              to-violet-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-blue-500/20
              transition-all
              hover:scale-[1.02]
              hover:from-blue-500
              hover:to-violet-500
            "
          >
            <RefreshCcw size={15} />
            Back to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
