const createInstance = async () => {
  const parserModule = await import('pdf2json');
  return new parserModule.default();
};

export const parsePdf = async (binaryData: Buffer): Promise<string[]> => {
  const pdfParser = await createInstance();

  return new Promise((resolve, reject) => {
    pdfParser.on('pdfParser_dataReady', (pdfData) => {
      const result: string[] = [];

      pdfData.Pages.forEach((pageData) => {
        pageData.Texts.forEach((textItem) => {
          textItem.R.forEach((rItem) => {
            result.push(decodeURIComponent(rItem.T));
          });
        });
      });

      resolve(result);
    });

    pdfParser.on('error', (error) => {
      reject(error);
    });

    pdfParser.on('pdfParser_dataError', (error) => {
      reject(error);
    });

    pdfParser.parseBuffer(binaryData);
  });
};
