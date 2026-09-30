import { useEffect, useState } from 'react';

export function useHashTab(defaultTab) {
  const [tab, setTab] = useState(() => window.location.hash.replace('#', '') || defaultTab);

  useEffect(() => {
    const onHashChange = () => setTab(window.location.hash.replace('#', '') || defaultTab);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [defaultTab]);

  const go = (next) => {
    window.location.hash = next;
    setTab(next);
  };

  return [tab, go];
}
