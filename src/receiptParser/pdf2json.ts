import { Observable } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFParser = require('pdf2json');

interface LineData {
  x: number;
  y: number;
  w: number;
  l: number;
  oc: string;
  dsh?: number;
}

interface RData {
  T: string;
  S: number;
  TS: number[];
}

interface TextData {
  x: number;
  y: number;
  w: number;
  sw: number;
  A: string;
  R: RData[];
}

interface PageData {
  Width: number;
  Height: number;
  HLines: LineData[];
  VLines: LineData[];
  Fills: any[];
  Texts: TextData[];
  Fields: any[];
  Boxsets: any[];
}

interface MetaData {
  PDFFormatVersion: string;
  IsAcroFormPresent: boolean;
  IsXFAPresent: boolean;
  Creator: string;
  Producer: string;
  CreationDate: string;
  ModDate: string;
  Metadata: Record<string, any>;
}

export interface PdfData {
  Transcoder: string;
  Meta: MetaData;
  Pages: PageData[];
}

type EventName = 'readable' | 'data' | 'error' | 'pdfParser_dataError' | 'pdfParser_dataReady';

type ListenerFunction<T> = T extends 'readable'
  ? (meta: MetaData) => void
  : T extends 'data'
  ? (page: PageData) => void
  : T extends 'error'
  ? (error: Error) => void
  : T extends 'pdfParser_dataError'
  ? (error: Error) => void
  : T extends 'pdfParser_dataReady'
  ? (pdfData: PdfData) => void
  : never;

type OnFunction = <T extends EventName>(eventName: T, listener: ListenerFunction<T>) => void;

interface PDFParser {
  loadPDF: (path: string) => void;
  on: OnFunction;
  parseBuffer: (buffer: Buffer) => void;
}

export const createPdf2JsonInstance = (): PDFParser => {
  return <PDFParser>new PDFParser();
};

export const parsePdf = (binaryData: Buffer) => {
  return new Observable<string>((subscriber) => {
    const pdfParser = createPdf2JsonInstance();

    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      pdfData.Pages.forEach((pageData) => {
        pageData.Texts.forEach((textItem) => {
          textItem.R.forEach((rItem) => {
            const value = decodeURIComponent(rItem.T);

            subscriber.next(value);
          });
        });
      });

      subscriber.complete();
    });

    pdfParser.on('error', (error) => {
      subscriber.error(error);
    });

    pdfParser.on('pdfParser_dataError', (error) => {
      subscriber.error(error);
    });

    pdfParser.parseBuffer(binaryData);
  });
};
