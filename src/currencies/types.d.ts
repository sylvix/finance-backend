export interface OERCurrenciesResponse {
  [key: string]: string;
}

export interface IsoCurrenciesXMLItem {
  // Country Name
  CtryNm: string;
  // Currency Name
  CcyNm: string;
  // Currency Code
  Ccy: string;
  // Currency Number
  CcyNbr: string;
  // Number of units (decimals)
  CcyMnrUnts: string;
}

export interface IsoCurrenciesXMLResponse {
  '?xml': {
    '@_version': string;
    '@_encoding': string;
    '@_standalone': string;
  };
  ISO_4217: {
    CcyTbl: {
      CcyNtry: IsoCurrenciesXMLItem[];
    };
  };
  '@_Pblshd': string;
}

export interface IsoCurrencies {
  [code: string]: {
    name: string;
    decimals: number;
  };
}
