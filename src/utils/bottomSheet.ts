export const SHEET_COLLAPSED_RATIO = 0.75;

export const SHEET_SPRING_CONFIG = {
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export type SheetSnapState = 'collapsed' | 'expanded';
export type SheetSnapAction = SheetSnapState | 'dismiss';

export function resolveSheetSnap(
  currentState: SheetSnapState,
  gesture: { dy: number; vy?: number }
): SheetSnapAction {
  const velocityY = gesture.vy ?? 0;

  if (currentState === 'collapsed') {
    if (gesture.dy > 60 || velocityY > 0.8) return 'dismiss';
    if (gesture.dy < -50 || velocityY < -0.5) return 'expanded';
    return 'collapsed';
  }

  if (gesture.dy > 50 || velocityY > 0.5) return 'collapsed';
  return 'expanded';
}
