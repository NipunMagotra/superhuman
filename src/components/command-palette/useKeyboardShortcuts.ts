import { useEffect } from 'react';

type KeyCombo = string;

interface ShortcutOptions {
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: Record<KeyCombo, (e: KeyboardEvent) => void>,
  options: ShortcutOptions = {}
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 1. Ignore if typing in an input, textarea, or contenteditable
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // 2. Identify key combinations
      const keys: string[] = [];
      if (event.ctrlKey) keys.push('ctrl');
      if (event.metaKey) keys.push('cmd');
      if (event.altKey) keys.push('alt');
      if (event.shiftKey) keys.push('shift');

      // Key code cleanups
      let key = event.key.toLowerCase();
      if (key === ' ') key = 'space';
      keys.push(key);

      const combo = keys.join('+');

      // Check if we have an exact match (e.g. 'ctrl+k', 'c', 'j')
      const handler = shortcuts[combo] || shortcuts[event.key];

      if (handler) {
        if (options.preventDefault !== false) {
          event.preventDefault();
        }
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, options]);
}
