export function calculateReadingTime(content: string): number {
  return Math.ceil(content.split(' ').length / 200);
}
