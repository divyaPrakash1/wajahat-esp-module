import { HttpClient, HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AttachmentService } from 'src/app/shared/services/attachment.service';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AttachmentDeletePopupComponent } from '../dailogs/attachment-delete-popup/attachment-delete-popup.component';

@Component({
  selector: 'app-project-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.scss']
})
export class AttachmentsComponent implements OnInit {
  @Input() entityid: any;
  @Input() entity: any = 'project';
  @Input() class = 'box';
  @Input() type = 'public';
  @Output() update = new EventEmitter<any>();

  loading = true;
  attachmentList: Array<any> = [];
  totalrecord: 0;
  attachmentPopup = false;
  allAttachmentList: Array<any> = [];
  popupLoading = false;
  isUploading = false;
  isSharing = false;
  uploadLoading = false;
  uploadForm: FormGroup;
  todayDateDisplay = moment.utc(new Date()).local().format('DD MMM YYYY');
  fileData = {
    type: '',
    extension: '',
    size: '',
  };
  emails: Array<any> = [];
  public emailValidators = [ this.mustBeEmail ];
  public errorMessages = {
    must_be_email: 'Enter valid email adress!'
  };
  isEditing = false;
  isDetail = false;
  selectedAttachment: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService,
    private attachmentService: AttachmentService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog,
  ) {
    this.uploadForm =  this.fb.group({
      emails: [''],
      name: [''],
      version: ['V1'],
      purpose: [''],
      file: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    console.log(moment().unix());
    this.getFilesByProject();
  }
  private mustBeEmail(control: FormControl): any{
      const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
      if (control.value !== '' && (control.value.length <= 5 || !EMAIL_REGEXP.test(control.value))) {
          return { must_be_email: true };
      }
      return null;
  }
  getFilesByProject(): void{
    this.loading = true;
    this.http.post(environment.baseURL + '/api/File/GetFilesByEntity', {
      entityId: this.entityid,
      module: this.entity,
      visibilityMode: this.type === 'private' ? 2 : 1,
      search: '',
      pageNo: 0,
      pageSize: this.type === 'private' ? 2 : 1
    }).subscribe((results: any) => {
      this.totalrecord = results.recordCount;
      this.attachmentList = results.result.map((file: any) => {
        return this.attachmentItemValues(file);
      });
      this.loading = false;
    }, error => {
      this.loading = false;
      console.log(error);
    });
  }
  getAllFilesByProject(): void{
    this.popupLoading = true;
    // tslint:disable-next-line: max-line-length
    this.http.post(environment.baseURL + '/api/File/GetFilesByEntity', {
      entityId: this.entityid,
      module: this.entity,
      visibilityMode: this.type === 'private' ? 2 : 1,
      search: '',
      pageNo: 0,
      pageSize: 1000
    }).subscribe((results: any) => {
      this.totalrecord = results.recordCount;
      this.allAttachmentList = results.result.map((file: any) => {
        return this.attachmentItemValues(file);
      });
      this.popupLoading = false;
    }, error => {
      this.popupLoading = false;
    });
  }
  attachmentItemValues(file: any): void{
    file.type = this.attachmentService.getFileType(file);
    file.created_date = moment.utc(file.fileCreatedOn).local().format('DD MMM YYYY');
    file.submission_date = moment.utc(file.submissionDate).local().format('DD MMM YYYY');
    file.metaData = !file.metaData ? '' : JSON.parse(file.metaData);
    console.log(file);
    return file;
  }
  onUploadCliked(): void{
    // document.getElementById('uploadAttachFile')?.click();
    this.isUploading = true;
    this.isSharing = false;
    this.todayDateDisplay = moment.utc(new Date()).local().format('DD MMM YYYY');
    this.uploadForm.reset();
    this.uploadForm.patchValue({
      name: '',
      version: 'V1',
      purpose: '',
      file: '',
    });
    this.emails = [];
  }
  onUploadChange(event: Event): void{
    const target: any = event.target;
    let file = target ? target.files : [];
    if (file.length > 0){
      file = file[0];
      console.log(file.size, (10 * 1024 * 1024));
      if (file.size > (10 * 1024 * 1024)){
        this.snackbar.open('File size should be less than 10mb', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
      else{
        if (!this.authService.FileServerToken){
          this.authService.getFileToken().subscribe((a: any) => {
            this.uploadFileToFileServer(file);
          });
        }
        else{
          this.uploadFileToFileServer(file);
        }
      }
    }
  }
  uploadFileToFileServer(file: File): any{
    console.log(file);
    const formdata = new FormData();
    formdata.append('file', file);
    this.loading = true;
    this.popupLoading = true;
    // const headers = new HttpHeaders({'Content-Type': 'multipart/form-data'});
    this.http.post(environment.file.api + '/api/file/Upload', formdata, {
      reportProgress: true,
      responseType: 'json',
    }).subscribe((fileInfo: any) => {
      this.http.post(environment.baseURL + '/api/File/SaveFileInfo', {
        module: this.entity,
        entityId: this.entityid,
        fileUniqueKey: fileInfo.fileId,
        fileName: fileInfo.fileName,
        fileSize: fileInfo.fileSize,
        fileType: fileInfo.fileType,
        version: '',
        purpose: '',
        submissionDate: moment(moment().unix()).utc().format(),
        approvalDate: moment(moment().unix()).utc().format(),
        metaData: '',
        fileCreatedOn: moment().utc().format(),
        visibilityMode: this.type === 'private' ? 2 : 1,
      }).subscribe((a: any) => {
        this.attachmentPopup ? this.getAllFilesByProject() : this.getFilesByProject();
      });
    }, error => {
      console.log(error);
      this.snackbar.open('Error occured. Please try again.', '', {
        duration: 3000,
        horizontalPosition: 'start',
      });
      this.attachmentPopup ? this.getAllFilesByProject() : this.getFilesByProject();
    });
  }
  onFileDetail(attachment: any): void{
    this.isDetail = true;
    this.selectedAttachment = attachment;
  }
  onFileDetailClose(): void{
    this.isDetail = false;
  }
  onFileDownload(attachment: any): void{
    const guid = attachment.fileUniqueKey;
    if (guid){
      this.http.get(environment.file.api + '/api/file?Id=' + guid, {
        reportProgress: true,
        responseType: 'blob',
        // headers
      }).subscribe((fileInfo: any) => {
        console.log(fileInfo);
        const blob = new Blob([fileInfo], {type: attachment.fileType});
        this.saveFile(blob, attachment.fileName);
      }, (error: any) => {
        console.log(error);
      });
    }
  }
  onFileDelete(attachment: any): void{
    const deleteDialog = this.dialog.open(AttachmentDeletePopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: {attachment}
    });
    deleteDialog.afterClosed().subscribe((result: any) => {
      if (result && result.reload){
        this.attachmentPopup ? this.getAllFilesByProject() : this.getFilesByProject();
      }
    });
  }
  saveFile = (blob: Blob, filename: string) => {
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const a = document.createElement('a');
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 0);
    }
  }
  closeAttachementPopup(event: Event): void{
    this.attachmentPopup = false;
    this.popupLoading = false;
    this.isUploading = false;
    this.isSharing = false;
    this.isEditing = false;
    this.getFilesByProject();
  }
  openAttachmentPopup(): void{
    this.attachmentPopup = true;
    this.popupLoading = true;
    this.getAllFilesByProject();
  }
  onFileEdit(attachment: any): void{
    this.selectedAttachment = attachment;
    this.uploadForm.patchValue({
      name: attachment.fileName,
      version: attachment.version,
      purpose: attachment.purpose,
      file: [''],
    });
    this.fileData = {
      type: attachment.type,
      extension: attachment.type,
      size: attachment.fileSize,
    };
    this.todayDateDisplay = attachment.submission_date;
    this.isEditing = true;
  }

  /*** New Upload Form Events  ***/
  isFormValid(): boolean{
    let result = true;
    if (!this.uploadForm.invalid && !this.isSharing){
      result = false;
    }
    else if (this.isSharing && !this.uploadForm.invalid && this.emails.length > 0){
      result = false;
    }
    return result;
  }
  onTabChange(isShare: boolean): void{
    this.isSharing = isShare;
    this.uploadForm.updateValueAndValidity();
    this.uploadForm.reset();
    this.uploadForm.patchValue({
      version: 'V1'
    });
    this.emails = [];
  }
  onUploadRowCliked(): void{
    document.getElementById('uploadFileInput')?.click();
  }
  onUploadFileInput(event: Event): void{
    const target: any = event.target;
    let file = target ? target.files : [];
    if (file.length > 0){
      file = file[0];
      console.log(file.size, (10 * 1024 * 1024));
      if (file.size > (10 * 1024 * 1024)){
        this.snackbar.open('File size should be less than 10mb', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
      else{
        this.fileData = {
          type: this.attachmentService.getFileType(file),
          extension: file.name ? file.name.split('.').pop() : 'file',
          size: this.attachmentService.getFileSize(file.size)
        };
        let name = this.uploadForm.value.name;
        if (name === '' || name === null){
          name = file.name.substring(0, 60);
        }
        this.uploadForm.patchValue({
          file,
          name
        });
        this.uploadForm.updateValueAndValidity();
      }
    }
  }
  onUploadRemove(): void{
    this.uploadForm.patchValue({
      file: null
    });
  }
  onUploadForm(): void{
    this.uploadLoading = true;
    this.loading = true;
    this.popupLoading = true;
    if (this.isEditing){
      const metaData = this.selectedAttachment.metaData;
      metaData.updatedBy = this.authService.userName;
      this.http.post(environment.baseURL + '/api/File/UpdateFileMetaData', {

        fileId: this.selectedAttachment.fileId,
        fileName: this.uploadForm.value.name ? this.uploadForm.value.name : this.selectedAttachment.fileName,
        version: this.uploadForm.value.version ? this.uploadForm.value.version : this.selectedAttachment.version,
        purpose: this.uploadForm.value.purpose,
        submissionDate: this.selectedAttachment.submissionDate,
        approvalDate: this.selectedAttachment.submissionDate,
        metaData : JSON.stringify(metaData),
        fileCreatedOn: this.selectedAttachment.submissionDate,
      }).subscribe((a: any) => {
        this.isUploading = false;
        this.uploadLoading = false;
        this.isEditing = false;
        this.attachmentPopup ? this.getAllFilesByProject() : this.getFilesByProject();
        this.uploadForm.reset();
      });
    }
    else{
      const file = this.uploadForm.value.file;
      const formdata = new FormData();
      formdata.append('file', file);
      // const headers = new HttpHeaders({'Content-Type': 'multipart/form-data'});
      this.http.post(environment.file.api + '/api/file/Upload', formdata, {
        reportProgress: true,
        responseType: 'json',
        observe: 'events'
      })
      .pipe(
        map((event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            const filler = document.getElementById('filler');
            if(filler) {
              filler.style.width = Math.round((100 / event.total) * event.loaded) + '%';
            }
          } else if (event.type === HttpEventType.Response) {
            console.log(event);
            const fileInfo = event.body;
            const onlyEmails = this.emails.map((e: any) => e.value);
            this.http.post(environment.baseURL + '/api/File/SaveFileInfo', {
              module: this.entity,
              entityId: this.entityid,
              fileUniqueKey: fileInfo.fileId,
              fileName: this.uploadForm.value.name ? this.uploadForm.value.name : fileInfo.fileName,
              fileSize: fileInfo.fileSize,
              fileType: fileInfo.fileType,
              version: this.uploadForm.value.version ? this.uploadForm.value.version : 'V1',
              purpose: this.uploadForm.value.purpose,
              submissionDate: moment().utc().format(),
              approvalDate: moment().utc().format(),
              metaData: JSON.stringify({
                UploadType: this.isSharing ? 'Shared' : 'Uploaded',
                ListOfEmails: onlyEmails,
                uploadedBy: this.authService.userName,
                updatedBy: ''
              }),
              fileCreatedOn: moment().utc().format(),
              visibilityMode: this.type === 'private' ? 2 : 1,
            }).subscribe((a: any) => {
              this.isUploading = false;
              this.uploadLoading = false;
              this.isEditing = false;
              if (this.isSharing){
                this.http.post(environment.baseURL + '/api/File/SendFileAsEmail', {
                  fileName: this.uploadForm.value.name ? this.uploadForm.value.name : fileInfo.fileName,
                  fileIdWhichYouWillSendToMakeThisServiceDependentDueToLowCompetencyJuniorDeveloperLevelMindSet: a.result.fileId,
                  documentBodyWhichYouWillNotSendDueToLowCompetencyLevelAndVirtuallyArchitectMind: '',
                  description: '',
                  subject: '',
                  mailTo: onlyEmails,
                  sharedBy: this.authService.userName
                }).subscribe();
              }
              this.attachmentPopup ? this.getAllFilesByProject() : this.getFilesByProject();
              this.uploadForm.reset();
            });
          }
        }),
        catchError((err: any) => {
          alert(err.message);
          return throwError(err.message);
        })
      )
      .toPromise();
    }
  }
}
