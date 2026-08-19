"use client";

import React from "react";

/**
 * Catches render crashes inside the Content/Style/Advanced panels when a
 * specific element's settings shape doesn't match what a panel expects
 * (e.g. "Cannot read properties of undefined (reading 'X')" for some
 * field a particular widget type doesn't have). Without this, selecting
 * that one element crashed the entire right sidebar — and depending on
 * where the crash happened in the render tree, could take the whole
 * editor down with it — with no way to recover except reloading and
 * avoiding that element. Now it's contained to just the panel, with a
 * clear message instead of a blank/broken editor.
 */
export class PanelErrorBoundary extends React.Component<
  { panelName: string; elementType?: string; children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { panelName: string; elementType?: string; children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[Editor] ${this.props.panelName} panel crashed for element type "${this.props.elementType}":`, error, info);
  }

  componentDidUpdate(prevProps: { elementType?: string }) {
    // Selecting a different element after a crash should get a fresh try,
    // not stay stuck on the error state from the previous element.
    if (this.state.error && prevProps.elementType !== this.props.elementType) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 text-xs text-gray-500 dark:text-gray-400">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
            Couldn&apos;t load {this.props.panelName.toLowerCase()} settings for this element.
          </p>
          <p>Try selecting a different element, or a section/container around it instead.</p>
        </div>
      );
    }
    return this.props.children;
  }
}
