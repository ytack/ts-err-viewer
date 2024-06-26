import { TsErrInfo, TsErrPIDInfo } from '@/ts_err_parser/TsErrInfo';
import TsErrParserUnsupportedFileError from '@/ts_err_parser/TsErrParserUnsupportedFileError';
import { codeToString, convert } from 'encoding-japanese';

export default abstract class AbstractTsErrParser {
  abstract checkIsSupported(file: File): boolean;

  abstract parsePIDs(rawText: string): TsErrPIDInfo[];

  parseAsync(file: File): Promise<TsErrInfo | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = (() => {
        // EDCB の *.ts.err は Shift-JIS か UTF-8 で出力される
        // encoding.js で一律 UTF-8 に変換する
        const unicodeArray = convert(new Uint8Array(reader.result as ArrayBuffer), 'UNICODE');
        const rawText = codeToString(unicodeArray);

        const pids = this.parsePIDs(rawText);
        if (!pids.length) {
          reject(new TsErrParserUnsupportedFileError('could not detect any PID'));
        }

        const tsErrInfo = {
          fileName: file.name,
          rawText,
          pids,
        };

        resolve(tsErrInfo);
      });

      reader.readAsArrayBuffer(file);
    });
  }
}
