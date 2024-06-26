import { TsErrInfo } from '@/ts_err_parser/TsErrInfo';
import TsErrParserUnsupportedFileError from '@/ts_err_parser/TsErrParserUnsupportedFileError';
import AbstractTsErrParser from './parser/AbstractTsErrParser';
import EdcbErrParser from './parser/EdcbErrParser';
import Multi2DecTxtParser from './parser/Multi2DecTxtParser';
import EpgStationDropLogParser from './parser/EpgStationDropLogParser';

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
