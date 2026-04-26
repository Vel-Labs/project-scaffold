export type ContractValidationFailure = {
  ok: false;
  errors: string[];
};

export type ContractValidationSuccess = {
  ok: true;
  checked: {
    schemas: number;
    validExamples: number;
    invalidExamples: number;
  };
};

export type ContractValidationResult =
  | ContractValidationFailure
  | ContractValidationSuccess;

export type ContractJsonFile = {
  file: string;
  value: unknown;
};
