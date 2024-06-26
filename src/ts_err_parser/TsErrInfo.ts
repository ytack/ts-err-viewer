export type TsErrPidInfoCountPropType = 'total' | 'drop' | 'scramble';

export interface TsErrPidInfo {
  pid: number;
  name: string | null;
  total: number;
  drop: number;
  scramble: number;
}

export interface TsErrInfo {
  fileName: string;
  rawText: string;
  pids: TsErrPidInfo[];
}
