import { Observable } from 'rxjs';

const createInstance = async () => {
  const parserModule = await import('pdf2json');
  return new parserModule.default();
};

export const parsePdf = async (binaryData: Buffer) => {
  const pdfParser = await createInstance();

  return new Observable<string>((subscriber) => {
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
