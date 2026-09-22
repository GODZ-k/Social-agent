interface Props {
  label: string;
  tone: "approve" | "reject" | "neutral";
  small?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const tones = {
  approve: "bg-success text-white",
  reject: "bg-card text-destructive ring-1 ring-border",
  neutral: "bg-card text-muted-foreground ring-1 ring-border",
};

export function RoundAction({ label, tone, small, onClick, children }: Props) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`pressable grid place-items-center rounded-full shadow-raised ${small ? "size-12 [&_svg]:size-4.5" : "size-16 [&_svg]:size-6"} ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
