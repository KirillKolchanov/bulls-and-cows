const pad = (value: number): string => String(value).padStart(2, '0');

export const formatDuration = (ms: number): string => {
  const totalSeconds = Math.floor(Math.max(ms, 0) / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return hours > 0
    ? `${String(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${String(minutes)}:${pad(seconds)}`;
};
