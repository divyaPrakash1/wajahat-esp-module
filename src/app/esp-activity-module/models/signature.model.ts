import { SignatureType } from '../enums/enums';
import { ValueDetails } from './custom-field-value-model';

export class SignatureModel{
  id!: number;
  personaId!: number;
  type!: SignatureType;
  fontFamily!: string;
  file!: ValueDetails;
  fileGuid!: string;
  signatoryName!: string;
}
