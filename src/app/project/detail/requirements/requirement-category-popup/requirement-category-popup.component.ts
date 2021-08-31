import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';

export interface DialogData {
  id: number;
}
@Component({
  selector: 'app-requirement-category-popup',
  templateUrl: './requirement-category-popup.component.html',
  styleUrls: ['./requirement-category-popup.component.scss']
})
export class RequirementCategoryPopupComponent implements OnInit {
  id = 0;
  loading = true;
  moduleName = 'requirement-categories';

  tagList = [];
  selected = [];
  orginalSelected = [];
  resultRemove = true;
  resultadd = true;

  constructor(
    public dialogRef: MatDialogRef<RequirementCategoryPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.id = this.data.id;

    const allList = this.http.get(environment.baseURL + '/api/Tag/GetAllTags?module=' + this.moduleName);
    const selected = this.http.post(environment.baseURL + '/api/Tag/GetAllTagsAssociatedToEntity', {
      entityId: this.id,
      module: this.moduleName
    });

    forkJoin([allList, selected]).subscribe((results: any) => {
      const listItems = results[0];
      this.orginalSelected = results[1].result;
      this.tagList = listItems.result;
      this.selected = results[1].result.map((t: any) => {
        return {
          tagAssociationId: t.tagAssociationId,
          tagId: t.tagId,
        };
      });
      this.loading = false;
    }, error => {
      this.loading = false;
      this.cancel();
    });
  }
  cancel(): void{
    this.dialogRef.close({});
  }
  onClick(tag: any): void{
    const index = this.selected.findIndex((t: any) => t.tagId === tag.tagId);
    if (index === -1){
      this.selected.push({
        tagAssociationId: 0,
        tagId: tag.tagId,
      });
    }
    else{
      this.selected.splice(index, 1);
    }
  }
  onSubmit(): void{
    const removeList = this.orginalSelected.filter((t: any) => !this.selected.some((st: any) => st.tagId === t.tagId));
    const addList = this.selected.filter((t: any) => !this.orginalSelected.some((st: any) => st.tagId === t.tagId));
    this.loading = true;

    if (removeList.length > 0){
      this.resultRemove = false;
      const data = removeList.map((ta: any) => {
        return{
          tagAssociationId : ta.tagAssociationId
        };
      });
      this.http.post(environment.baseURL + '/api/Tag/DeAssociateTagsToEntity', data).subscribe({
        next: (result: any) => {
          this.loading = false;
          this.resultRemove = true;
          this.afterTagResult();
        },
        error: (err: any) => {
          this.loading = false;
          this.snackbar.open(err.message || 'Error occured while association of tags', '', {
            duration: 3000,
            horizontalPosition: 'start',
          });
        }
      });
    }
    if (addList.length > 0){
      this.resultadd = false;
      const data = addList.map((tg: any) => {
        return{
          tagId: tg.tagId,
          entityId: this.id,
          module: this.moduleName
        };
      });
      this.http.post(environment.baseURL + '/api/Tag/AssociateTagsToEntity', data).subscribe({
        next: (result: any) => {
          this.loading = false;
          this.resultadd = true;
          this.afterTagResult();
        },
        error: (err: any) => {
          this.loading = false;
          this.snackbar.open(err.message || 'Error occured while association of tags', '', {
            duration: 3000,
            horizontalPosition: 'start',
          });
        }
      });
    }
    this.afterTagResult();
  }
  afterTagResult(): void{
    if (this.resultRemove && this.resultadd){
      this.dialogRef.close({reload: true});
    }
  }
  isSelected(tagId: any): boolean{
    return this.selected.some((t: any) => t.tagId === tagId);
  }

}
