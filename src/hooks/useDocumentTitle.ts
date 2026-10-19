import { useEffect } from 'react';
import { config } from '../config';

/** Sets a descriptive document title per page (SEO + browser tabs). */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${config.appName}` : `${config.appName} · Book Movie Tickets Online`;
  }, [title]);
}
