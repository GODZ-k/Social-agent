/** Types the brand kit cards use and the API never sees. */

/** One card's edit state, shared so only one brand-kit card is ever open at a time. */
export interface CardControls {
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDone: () => void;
}

/** The cards a brand kit is edited in, one at a time. */
export type CardKey = "business" | "contact" | "audience" | "voice" | "looks";
