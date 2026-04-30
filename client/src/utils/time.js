// IST is UTC+5:30
export function toIST(date) {
  const d = new Date(date);
  // IST offset in ms
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + istOffset);
}

export function formatIST(date) {
  const ist = toIST(date);
  return ist.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }) + ' IST';
}

export function timeAgoWithIST(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  let ago;
  if (s < 60) ago = 'just now';
  else if (s < 3600) ago = `${Math.floor(s / 60)}m ago`;
  else if (s < 86400) ago = `${Math.floor(s / 3600)}h ago`;
  else ago = `${Math.floor(s / 86400)}d ago`;

  const stamp = formatIST(date);
  return { ago, stamp };
}

export function formatISTForCSV(date) {
  const ist = toIST(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${ist.getFullYear()}-${pad(ist.getMonth()+1)}-${pad(ist.getDate())} ${pad(ist.getHours())}:${pad(ist.getMinutes())}:${pad(ist.getSeconds())} IST`;
}
