import { TsErrInfo } from '@/models/ts-err-info';
import TsErrParserUnsupportedFileError from '@/models/ts-err-parser-unsupported-file-error';
import AbstractTsErrParser from './abstract-ts-err-parser';
import EdcbErrParser from './edcb-err-parser';
import Multi2DecTxtParser from './multi-2-dec-txt-parser';
import EpgStationDropLogParser from './epg-station-drop-log-parser';

const PARSERS = [EdcbErrParser, Multi2DecTxtParser, EpgStationDropLogParser];
const parsers = PARSERS.map((Parser) => new Parser() as AbstractTsErrParser);

// parse file to TsErrInfo
export default async function (file: File): Promise<TsErrInfo | null> {
  const parser = parsers.find((p) => p.checkIsSupported(file));

  if (!parser) {
    return Promise.reject(new TsErrParserUnsupportedFileError());
  }
  const tsErrs = await parser.parseAsync(file);
  return tsErrs;
}
