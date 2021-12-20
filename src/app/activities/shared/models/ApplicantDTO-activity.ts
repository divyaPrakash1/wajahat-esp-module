
export class ApplicantDTO {
  constructor(
  ) { }

  public id: number;
  public name: string;
  public emailAddress: string;
  public imageUrl: string;
  public profileTemplateString: string;
  public profileTemplates: number[];
  public applicantSections: ApplicantSectionDTO[];

}


export class ApplicantSectionDTO {
  constructor(
  ) {}

  public sectionId: number;
  public index: number;
  public values: ApplicantFieldValueDTO[];
  public lastUpdatedOn: Date;
}

export class ApplicantFieldValueDTO {
  constructor(
  ) { }

  public sectionFieldId: number;
  public value: string;
  public lookupValue?: string;
  public details?: any;
  public type?: number;  //used for target type in case of mapped
}
