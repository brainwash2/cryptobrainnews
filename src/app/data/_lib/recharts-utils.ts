/**
 * src/app/data/_lib/recharts-utils.ts
 *
 * Recharts injects `| undefined` into Tooltip formatter value parameters
 * at the type level regardless of the chart's actual data type, making any
 * concrete union signature fail TypeScript strict mode.
 *
 * This alias is the ONLY reliable workaround across all chart components.
 * Always import and use `RechartsFormatter` for every <Tooltip formatter={}> prop.
 *
 * Usage:
 *   import type { RechartsFormatter } from '@/app/data/_lib/recharts-utils';
 *   const myFmt: RechartsFormatter = (value, name) => [`${Number(value).toFixed(2)}`, String(name)];
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RechartsFormatter = (value: any, name: any) => [string, string];
