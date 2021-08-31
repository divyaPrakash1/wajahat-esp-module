import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProfilePicture } from 'src/app/shared/users/user-image';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-generic-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  @Input() entityid: any;
  @Input() entity: any;
  @Input() type = 'box';
  @Input() top = 1;
  @Output() update = new EventEmitter<any>();

  commentList: Array<any> = [];
  loading = false;
  totalrecord: 0;
  commentPopup = false;
  allCommentList: Array<any> = [];
  popupLoading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private profilePicture: ProfilePicture,
    private snackbar: MatSnackBar
  ){}

  ngOnInit(): void {
    this.getTopComments();
  }
  getTopComments(): void {
    this.loading = true;
    // tslint:disable-next-line: max-line-length
    this.http.get(environment.baseURL + '/api/Comment/GetAllComments?EntityId=' + this.entityid + '&Module=' + this.entity + '&pageNo=0&pageSize=' + this.top).subscribe((results: any) => {
      this.totalrecord = results.recordCount;
      this.commentList = results.result.map((comment: any) => {
        return this.commentItem(comment);
      });
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }
  getAllComments(): void {
    this.popupLoading = true;
    // tslint:disable-next-line: max-line-length
    this.http.get(environment.baseURL + '/api/Comment/GetAllComments?EntityId=' + this.entityid + '&Module=' + this.entity + '&pageNo=0&pageSize=1000').subscribe((results: any) => {
      this.totalrecord = results.recordCount;
      this.allCommentList = results.result.map((comment: any) => {
        return this.commentItem(comment);
      });
      this.popupLoading = false;
    }, error => {
      this.popupLoading = false;
    });
  }
  commentItem(comment: any): void{
    console.log(comment, this);
    comment.timeago = moment(comment.dateOfComment).fromNow();
    if ((!comment.pictureUri || comment.pictureUri === '') && this.type !== 'small'){
      const lastName = comment.userName.split(' ');
      comment.pictureUri = this.profilePicture.generate(comment.userName, lastName[lastName.length - 1]);
    }
    if (comment.commentType === '1'){
      comment.file = JSON.parse(comment.comment);
      comment.file.extension = comment.file.fileName ? comment.file.fileName.split('.').pop() : 'file';
    }
    console.log(comment);
    return comment;
  }
  onKey(event: KeyboardEvent): void{ // with type info
    const target = event.target as HTMLInputElement;
    if (event.key === 'Enter') {
      const value = target.value;
      console.log(value); // Enter
      this.loading = true;
      this.popupLoading = true;
      const data = {
        commentType: '0',
        module: this.entity,
        entityId: this.entityid,
        userId: this.authService.userId,
        userName: this.authService.userName,
        comment: value,
        dateOfComment: moment().utc().format(),
        parentCommentId: 0,
        commentFileId: ''
      };
      this.http.post(environment.baseURL + '/api/Comment/SaveComment', data).subscribe((results: any) => {
        this.commentPopup ? this.getAllComments() : this.getTopComments();
      }, error => {
        this.loading = false;
      });
    }
  }
  onDelete(comment: any): void { // with type info
    if (comment.commentType === '1'){
      const guid = comment.commentFileId;
      this.http.delete(environment.file.api + '/api/file/delete?id=' + guid, {responseType: 'text'}).subscribe((file: any) => {
        this.commentDelete(comment.commentId);
      });
    }
    else{
      this.commentDelete(comment.commentId);
    }
  }
  commentDelete(id: any): void{
    this.loading = true;
    this.popupLoading = true;
    this.http.delete(environment.baseURL + '/api/Comment/DeleteComment?CommentID=' + id).subscribe((results: any) => {
      this.commentPopup ? this.getAllComments() : this.getTopComments();
    }, error => {
      this.loading = false;
    });
  }
  onAttachClick(event: any): void {
    document.getElementById('commentFile')?.click();
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
      const data = {
        commentType: '1',
        module: this.entity,
        entityId: this.entityid,
        userId: this.authService.userId,
        userName: this.authService.userName,
        comment: JSON.stringify({
          fileName: fileInfo.fileName,
          fileSize: fileInfo.fileSize,
          fileType: fileInfo.fileType
        }),
        dateOfComment: moment().utc().format(),
        parentCommentId: 0,
        commentFileId: fileInfo.fileId
      };
      this.http.post(environment.baseURL + '/api/Comment/SaveComment', data).subscribe((results: any) => {
        this.commentPopup ? this.getAllComments() : this.getTopComments();
      }, error => {
        this.loading = false;
      });
    }, error => {
      console.log(error);
      this.snackbar.open('Error occured. Please try again.', '', {
        duration: 3000,
        horizontalPosition: 'start',
      });
      this.commentPopup ? this.getAllComments() : this.getTopComments();
    });
  }
  onFileDownload(comment: any): void{
    const guid = comment.commentFileId;
    if (guid){
      this.http.get(environment.file.api + '/api/file?Id=' + guid, {
        reportProgress: true,
        responseType: 'blob',
        // headers
      }).subscribe((fileInfo: any) => {
        console.log(fileInfo);
        const blob = new Blob([fileInfo], {type: comment.file.fileType});
        this.saveFile(blob, comment.file.filename);
      }, (error: any) => {
        console.log(error);
      });
    }
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
  closeCommentPopup(event: Event): void{
    this.commentPopup = false;
    this.popupLoading = false;
    this.getTopComments();
  }
  openCommentPopup(): void{
    this.commentPopup = true;
    this.popupLoading = true;
    this.getAllComments();
  }

}
