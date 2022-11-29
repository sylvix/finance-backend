declare module 'pdf2json' {
  declare interface LineData {
    x: number;
    y: number;
    w: number;
    l: number;
    oc: string;
    dsh?: number;
  }

  declare interface RData {
    T: string;
    S: number;
    TS: number[];
  }

  declare interface TextData {
    x: number;
    y: number;
    w: number;
    sw: number;
    A: string;
    R: RData[];
  }

  declare interface PageData {
    Width: number;
    Height: number;
    HLines: LineData[];
    VLines: LineData[];
    Fills: any[];
    Texts: TextData[];
    Fields: any[];
    Boxsets: any[];
  }

  declare interface MetaData {
    PDFFormatVersion: string;
    IsAcroFormPresent: boolean;
    IsXFAPresent: boolean;
    Creator: string;
    Producer: string;
    CreationDate: string;
    ModDate: string;
    Metadata: Record<string, any>;
  }

  declare interface PdfData {
    Transcoder: string;
    Meta: MetaData;
    Pages: PageData[];
  }

  declare type EventName = 'readable' | 'data' | 'error' | 'pdfParser_dataError' | 'pdfParser_dataReady';

  declare type ListenerFunction<T> = T extends 'readable'
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

  declare type OnFunction = <T extends EventName>(eventName: T, listener: ListenerFunction<T>) => void;

  declare class PDFParser {
    loadPDF(path: string): void;
    on: OnFunction;
    parseBuffer(buffer: Buffer): void;
  }

  export default PDFParser;
}
