import { Component, OnInit } from '@angular/core';
import { ProjectDetailService } from '../detail.service';
import { isEmpty } from 'lodash';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { AddTagsPopupComponent } from './add-tags-popup/add-tags-popup.component';


@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class GereralComponent implements OnInit {
  module = 'project';
  projectDetail: any = {};
  tagsLoading = true;
  tagList: Array<any> = [];
  tagModule = 'project-tags';

  constructor(
    private detailService: ProjectDetailService,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.detailService.getDetail.subscribe((d: any) => {
      if (!isEmpty(d)){
        console.log(d);
        this.projectDetail = d;
        this.getTags();
      }
    });
  }

  updateDetail(): any{
    //
  }
  getTags(): void{
    this.tagsLoading = true;
    // tslint:disable-next-line: max-line-length
    this.http.get(environment.baseURL + '/api/Tag/GetAllTagsV2?module=' + this.tagModule + '&EntityId=' + this.projectDetail.projectId).subscribe((results: any) => {
      const result: any = results.result;
      this.tagsLoading = false;
      this.tagList = result;
    });
  }
  addTags(): void{
    const tagDialog = this.dialog.open(AddTagsPopupComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: 'tag-popup-dailog',
      data: {
        list: this.tagList,
        module: this.tagModule,
        projectid: this.projectDetail.projectId
      }
    });
    tagDialog.afterClosed().subscribe((result: any) => {
      if (result.reload){
        this.getTags();
      }
    });
  }
  onDeleteTag(tag: any): void{
    this.tagsLoading = true;
    this.http.post(environment.baseURL + '/api/Tag/DeleteSystemTag', { tagId: tag.tagId }).subscribe((results: any) => {
      this.getTags();
    });
  }

}
