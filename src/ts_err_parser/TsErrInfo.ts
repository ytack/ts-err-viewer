export interface TsErrPidInfo {
  pid: number;
  name: string | null;
  total: number;
  drop: number;
  scramble: number;
}

export default interface TsErrInfo {
  fileName: string;
  rawText: string;
  pids: TsErrPidInfo[];
}
