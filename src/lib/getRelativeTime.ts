export function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.round((date - now) / 1000);

  // Define thresholds in seconds
  const units: {unit: Intl.RelativeTimeFormatUnit, seconds: number}[] = [
    { unit: 'year',   seconds: 31536000 },
    { unit: 'month',  seconds: 2592000 },
    { unit: 'week',   seconds: 604800 },
    { unit: 'day',    seconds: 86400 },
    { unit: 'hour',   seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 }
  ];

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const { unit, seconds } of units) {
    if (Math.abs(diffInSeconds) >= seconds || unit === 'second') {
      const value = Math.round(diffInSeconds / seconds);
      return rtf.format(value, unit);
    }
  }
  return Intl.DateTimeFormat('en', {day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"}).format(date)
}