import { SignatureType } from '../../shared/enums/singnature-type.enum-activity';
import { ValueDetails } from './custom-field-value-model-activity';

export class SignatureModel{
  id: number;
  personaId: number;
  type: SignatureType;
  fontFamily: string;
  file: ValueDetails;
  fileGuid: string;
  signatoryName: string;
}
