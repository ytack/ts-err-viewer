import { TsErrPIDInfo } from '@/ts_err_parser/TsErrInfo';
import AbstractTsErrParser from './AbstractTsErrParser';

export default class EpgStationDropLogParser extends AbstractTsErrParser {
  checkIsSupported(file: File): boolean {
    const REGEX = /.*\.m2ts(\(\d+\))?\.log$/;
    return REGEX.test(file.name);
  }

  parsePIDs(rawText: string): TsErrPIDInfo[] {
    const NEW_LINE_CODE = '\n';
    const TS_ERR_PID_REGEX = /^pid: 0x([\dA-F]{4}), error: \d+, drop: (\d+), scrambling: (\d+), packet: (\d+), name: (.*)$/;
    // [1]: PID(HEX)
    // [2]: Drop
    // [3]: Scramble
    // [4]: Total (packet)
    // [5]: PID name

    return rawText
      .split(NEW_LINE_CODE)
      .filter((line) => TS_ERR_PID_REGEX.test(line))
      .map((line) => {
        const matches = line.match(TS_ERR_PID_REGEX);

        // 入らないはず
        if (!matches) {
          return {} as TsErrPIDInfo;
        }

        return {
          pid: parseInt(matches[1], 16),
          name: matches[5],
          total: Number(matches[4]),
          drop: Number(matches[2]),
          scramble: Number(matches[3]),
        } as TsErrPIDInfo;
      });
  }
}
