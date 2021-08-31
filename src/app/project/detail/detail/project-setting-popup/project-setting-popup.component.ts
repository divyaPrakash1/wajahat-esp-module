import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl} from '@angular/forms';
import { capitalize } from 'lodash';

export interface DialogData {
  projectid: number;
  setting: any
}

@Component({
  selector: 'app-project-setting-popup',
  templateUrl: './project-setting-popup.component.html',
  styleUrls: ['./project-setting-popup.component.scss']
})
export class ProjectSettingPopupComponent implements OnInit {
  projectId = 0;
  loading = true;
  setting: any= {};
  settingList = [];

  constructor(
    public dialogRef: MatDialogRef<ProjectSettingPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.projectId = this.data.projectid;
    this.setting = this.data.setting;
    this.http.get(environment.baseURL + '/api/Project/GetProjectSettings?ProjectId='+this.projectId).subscribe({
      next: (result: any) => {
        this.settingList = this.settingArrayFormatter(result.result.projectSettingJson);
        this.loading = false;
      },
      error: (error: any) => {
        this.cancel();
      }
    });
  }
  settingArrayFormatter(json: any): any{
    const array = json ? JSON.parse(json) : [];
    let returnArray = [];
    for (let [key, value] of Object.entries(this.setting)) {
      const found = array.find((a:any)=> a.name === `${key}`);
      returnArray.push({
        name: found ? found.name : `${key}`,
        label: capitalize(`${key}`),
        value: found ? found.value : true,
        control: new FormControl(found ? found.value : true)
      });
    }
    return returnArray;
  }
  cancel(): void{
    this.dialogRef.close({});
  }
  change(): void{
    this.loading = true;
    this.http.post(environment.baseURL + '/api/Project/UpdateProjectSettings', {
      projectId: this.projectId,
      projectSettingJson: JSON.stringify(this.settingList.map((s:any) => {
        return {
          name: s.name,
          label: s.label,
          value: s.control.value,
        }
      }))
    }).subscribe({
      next: (result: any) => {
        this.loading = false;
        this.dialogRef.close({reload: true});
      },
      error: (err: any) => {
        this.loading = false;
        this.snackbar.open(err.message || 'Error occured while change project setting', '', {
          duration: 3000,
          horizontalPosition: 'start',
        });
      }
    });
  }

}
