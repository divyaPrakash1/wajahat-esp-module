import { HttpErrorResponse } from '@angular/common/http';

export class ApiError {
  constructor(public type: ApiErrorType, public message: string, public extra: string, public helpLink: string) {
  }

  static fromResponse(errorResponse: HttpErrorResponse) {
    const err = errorResponse.error || {};
    return new ApiError(err.IdenediExceptionType, err.Message, err.ExtraInfo, err.HelpLink);
  }
}

export enum ApiErrorType {
  InvalidUser = 'INVALID_USER',
  InvalidPassword = 'INVALID_PASSWORD',
  PhoneExists = 'PHONE_ALREADY_EXISTS',
  InvalidCode = 'INVALID_VERIFICATION_CODE'
}
