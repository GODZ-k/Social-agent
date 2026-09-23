# packages/ui/src/components/social/swipe-card.tsx

- Decision · type · L20-L20 — type Decision = "approved" | "rejected";
- SwipeCardHandle · interface · L21-L24 — interface SwipeCardHandle
- Props · interface · L35-L45 — interface Props
- progress · function · L70-L70 — progress = (v: number)
- mix · function · L71-L75 — mix = (key: "scale" | "y")
- throwOut · function · L79-L94 — function throwOut(decision: Decision, velocity = 0)
- handleDragEnd · function · L98-L110 — function handleDragEnd(_: unknown, info: PanInfo)
- Stamp · function · L154-L174 — function Stamp({ opacity, side, tone, children, }: { opacity: MotionValue<number>; side: "left" | "right"; tone: "approve" | "reject"; children: React.ReactNode; })
