/**
 * Class name cn - conditional class joining
 * Similar to classnames but with TypeScript typing
 */
export function cn(...classes: (string | undefined | boolean | null)[]): string {
  return classes
    .filter((c) => c && typeof c !== 'undefined')
    .join(' ')
}