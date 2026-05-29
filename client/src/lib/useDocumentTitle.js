import { useEffect } from 'react';

const SUFFIX = ' — MotoSpec Compare';

export function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = title.endsWith(SUFFIX) ? title : `${title}${SUFFIX}`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
