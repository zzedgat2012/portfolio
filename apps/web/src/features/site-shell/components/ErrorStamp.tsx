'use client';

import { useEffect, useState } from 'react';

/** `Error #0404 • Timestamp: …`; the time is the visitor's, so it is filled in after hydration. */
export function ErrorStamp() {
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    setTimestamp(new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00'));
  }, []);

  return (
    <p className="font-mono text-xs text-muted-foreground">
      Error #0404{timestamp && ` • Timestamp: ${timestamp}`}
    </p>
  );
}
