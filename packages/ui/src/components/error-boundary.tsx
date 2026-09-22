"use client";

import { Component, type ReactNode } from "react";
import { ErrorState, Panel } from "./states";

interface Props {
  children: ReactNode;
  /** Names the part that failed, e.g. "Best performing posts". */
  label: string;
}

interface State {
  error: Error | null;
}

/**
 * Keeps one failed panel from blanking the page. Server components cannot pass
 * a fallback function across the boundary, so the fallback is fixed: the same
 * error state the routes use, inside a panel, with a retry that re-renders.
 */
export class PanelBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <Panel aria-label={this.props.label}>
        <ErrorState error={error} onRetry={() => this.setState({ error: null })} />
      </Panel>
    );
  }
}
