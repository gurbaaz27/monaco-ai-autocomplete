import type { MonacoModel, MonacoPosition } from "../types"

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function extractContext(
  model: MonacoModel,
  position: MonacoPosition,
  maxPrefixChars: number = 4000,
  maxSuffixChars: number = 1000
): { prefix: string; suffix: string; offset: number } {
  const fullText = model.getValue();
  const offset = model.getOffsetAt(position);

  const prefix = fullText.slice(Math.max(0, offset - maxPrefixChars), offset);
  const suffix = fullText.slice(offset, Math.min(fullText.length, offset + maxSuffixChars));

  return { prefix, suffix, offset };
}
