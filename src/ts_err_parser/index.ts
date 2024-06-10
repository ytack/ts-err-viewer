import { TsErrInfo } from '@/models/TsErrInfo';
import TsErrParserUnsupportedFileError from '@/models/TsErrParserUnsupportedFileError';
import AbstractTsErrParser from './AbstractTsErrParser';
import EdcbErrParser from './EdcbErrParser';
import Multi2DecTxtParser from './Multi2DecTxtParser';
import EpgStationDropLogParser from './EpgStationDropLogParser';

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
