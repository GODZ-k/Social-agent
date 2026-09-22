"use client";

import { Check, Pencil, X } from "lucide-react";
import { RoundAction } from "./round-action";

interface Props {
  onReject: () => void;
  onEdit: () => void;
  onApprove: () => void;
}

export function ApprovalActions({ onReject, onEdit, onApprove }: Props) {
  return (
    <>
      <div className="mt-6 flex items-center gap-4">
        <RoundAction label="Reject" tone="reject" onClick={onReject}><X strokeWidth={2.6} /></RoundAction>
        <RoundAction label="Edit before deciding" tone="neutral" small onClick={onEdit}><Pencil /></RoundAction>
        <RoundAction label="Approve" tone="approve" onClick={onApprove}><Check strokeWidth={2.6} /></RoundAction>
      </div>
      <p className="type-label mt-4 hidden text-center lg:block">Arrow keys decide, E edits, Space enlarges the image.</p>
    </>
  );
}
