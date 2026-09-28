"use client";

import { Pencil } from "lucide-react";
import { Panel } from "@repo/ui/components/states";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { cn } from "@/lib/utils";

/** One card's edit state, shared so only one brand-kit card is ever open at a time. */
export interface CardControls {
  editing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onDone: () => void;
}

/** The chrome around a brand-kit card: read-only until Edit is tapped, then Cancel/Done swap it back. */
export function EditableCard({
  title,
  editing,
  onEdit,
  onCancel,
  onDone,
  children,
}: CardControls & { title: string; children: React.ReactNode }) {
  return (
    <Panel className={cn(editing && "ring-2 ring-primary")}>
      <div className="mb-3.5 flex items-center justify-between gap-4">
        <h2 className="type-heading">{title}</h2>
        {editing ? (
          <Badge variant="tint">Editing</Badge>
        ) : (
          <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )}
      </div>
      {children}
      {editing && (
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={onDone}>
            Done
          </Button>
        </div>
      )}
    </Panel>
  );
}
