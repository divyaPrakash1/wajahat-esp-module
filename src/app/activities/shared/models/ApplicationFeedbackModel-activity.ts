export class ApplicationFeedbackModel {
  constructor() {
    this.deletedFiles = [];
  }
  public id: number;
  public userId: number;
  public commentUserId: number;
  public assessmentId: number;
  public applicationId: number;
  public fullName: string;
  public imageUrl: string;
  public attachments: AttachmentDetailModel[];
  public deletedFiles: string[];
  public comment: string;
  public isVisibletoApplicant: boolean;
  public createdOn: Date;
  public isOwner: boolean;
  public isAdmin: boolean;
  public showOwnerInfo: boolean;
}

export class AttachmentDetailModel {

  public name: string;
  public mimeType: string;
  public createdOn: Date;
  public downloadUrl: string;
  public fileId: string;
}
