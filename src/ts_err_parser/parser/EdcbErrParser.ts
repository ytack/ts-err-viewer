import { TsErrPIDInfo } from '@/models/TsErrInfo';
import AbstractTsErrParser from './AbstractTsErrParser';

export default class EdcbErrParser extends AbstractTsErrParser {
  checkIsSupported(file: File): boolean {
    const REGEX = /.*\.ts.err$/;
    return REGEX.test(file.name);
  }

  parsePIDs(rawText: string): TsErrPIDInfo[] {
    const NEW_LINE_CODE = '\r\n';
    const TS_ERR_PID_REGEX = /^PID:0x([\dA-F]{4})Total:(\d+)Drop:(\d+)Scramble:(\d+)(.*)$/;
    // [1]: PID(HEX)
    // [2]: Total
    // [3]: Drop
    // [4]: Scramble
    // [5]: PID name

    return rawText
      .replace(/ /g, '')
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
          total: Number(matches[2]),
          drop: Number(matches[3]),
          scramble: Number(matches[4]),
        } as TsErrPIDInfo;
      });
  }
}
