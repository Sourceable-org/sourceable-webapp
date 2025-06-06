export const getCurrentTimestamps = () => {
  const now = new Date();
  return {
    local: now.toISOString(),
    utc: now.toUTCString(),
  };
};

export const formatTimestamp = (timestamp: string, format: 'local' | 'utc' = 'local'): string => {
  const date = new Date(timestamp);
  
  if (format === 'utc') {
    return date.toUTCString();
  }
  
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
}; 