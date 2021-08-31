import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AttachmentService {

  constructor() { }

  getFileSize(bytes: any): string {
    const decimals = 1;
    if (bytes === 0){
      return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  getFileType(file: any): any {
    const fileType = file.type ? file.type : file.fileType;
    if (fileType.includes('image/')){
      return 'img';
    }
    else if (fileType.includes('video/')){
      return 'mp4';
    }
    else if (fileType.includes('audio/')){
      return 'mp3';
    }
    else if (fileType === 'application/pdf'){
      return 'pdf';
    }
    else if (fileType === 'application/x-7z-compressed' ||
          fileType === 'application/zip' ||
          fileType === 'application/vnd.rar' ||
          fileType === 'application/gzip' ||
          fileType === 'application/x-tar'
    ){
      return 'zip';
    }
    else if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-' || fileType === 'officedocument.wordprocessingml.document' || fileType === 'text/plain'){
      return 'doc';
    }
    else if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-' || fileType === 'officedocument.spreadsheetml.sheet'){
      return 'xls';
    }
    else if (fileType === 'application/vnd.ms-powerpoint' || fileType === 'application/vnd.openxmlformats-' || fileType === 'officedocument.presentationml.presentation'){
      return 'pptx';
    }
    return 'file';
  }

}
