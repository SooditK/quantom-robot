export type OCR = {
  ParsedResults?: (ParsedResultsEntity)[] | null;
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ProcessingTimeInMilliseconds: string;
  SearchablePDFURL: string;
}
export type ParsedResultsEntity = {
  TextOverlay: TextOverlay;
  TextOrientation: string;
  FileParseExitCode: number;
  ParsedText: string;
  ErrorMessage: string;
  ErrorDetails: string;
}
export type TextOverlay = {
  Lines?: (null)[] | null;
  HasOverlay: boolean;
  Message: string;
}

