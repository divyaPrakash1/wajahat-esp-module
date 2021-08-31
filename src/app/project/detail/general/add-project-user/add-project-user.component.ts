import { HttpClient } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { forkJoin} from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';

export interface DialogData {
  projectid: number;
  selected: any | undefined;
}
export interface User {
  id: number;
  name: string;
}
export interface Roles {
  id: number;
  name: string;
}

@Component({
  selector: 'app-add-project-user',
  templateUrl: './add-project-user.component.html',
  styleUrls: ['./add-project-user.component.scss']
})
export class AddProjectUserComponent implements OnInit {
  selected: any;
  projectId = 0;
  loading = true;
  moduleName = 'project';
  editMode = false;
  firstTime = true;
  falseValue = false;

  ownerList: User[] = [];
  owner = new FormControl();
  roleList: Roles[] = [];
  role = new FormControl();
  description = new FormControl();
  permissionList: Array<any> = [];
  permissions: Array<any> = [];

  constructor(
    public dialogRef: MatDialogRef<AddProjectUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private authService: AuthService,
  ) {
    this.projectId = this.data.projectid;
    this.selected = this.data.selected;
    if (this.selected){
      this.editMode = true;
    }
  }

  ngOnInit(): void {

    const users = this.http.get(environment.baseURL + '/api/User/GetListOfUsers');
    const roles = this.http.get(environment.baseURL + '/api/Project/GetRoleList');
    const alreadyUsers = this.http.post(environment.baseURL + '/api/ProjectShare/GetUsersSharedWithProject', {
      ProjectId: this.projectId,
      PageNo: 0,
      PageSize: 100,
      search: ''
    });

    forkJoin({roles, users, alreadyUsers}).subscribe((results: any) => {
      let userList = results.users.result;
      this.roleList = results.roles.result;
      const addedUsers: any = results.alreadyUsers.result.map((l: any) => l.userId);
      if (!this.editMode){
        userList = userList.filter((u: any) => !addedUsers.includes(u.userId));
      }
      this.ownerList = userList.map((u: any) => {
        return {
          id: u.userId,
          name: u.userFirstName + ' ' + u.userLastName
        };
      });

      if (this.editMode){
        // this.owner.patchValue({
        //   id: this.selected.userId,
        //   name: this.selected.userFirstName + ' ' + this.selected.userLastName
        // });


        const user = this.ownerList.find((r: any) => r.id === this.selected.userId);
        this.owner.patchValue(user);

        const role = this.roleList.find((r: any) => r.id === this.selected.roleId);
        this.roleSelected(role);
        this.role.patchValue(role);

        this.description.patchValue(this.selected.descriptionOfRole);
        this.permissions = this.selected.permissions.map((p: any) => p.permissionId);
      }

      this.loading = false;
    }, error => {
      this.loading = false;
      this.onCancel();
    });
  }
  getPermissionByRole(): void{
    console.log(this.role.value);
    if (this.role.value && this.role.value !== null){
      this.http.get(environment.baseURL + '/api/Project/GetUserSharePermissionSet?RoleId=' + this.role.value.id + '&EntityType=project'
      ).subscribe({
        next: (results: any) => {
          console.log(results);
          this.permissionList = results.result;
          if(!this.editMode || !this.firstTime){
            this.permissions = this.permissionList.filter((p: any) => p.active).map((m: any) => m.id);
          }
          this.firstTime = false;
        },
        error: (error) => {
          this.snackbar.open(error.error.message || 'Something went wrong', '', {
            duration: 3000,
            panelClass: 'snackbar-xerror',
            horizontalPosition: 'start',
          });
        }
      });
    }
  }
  ownerSelected(event: any): void{
    this.owner.patchValue(event);
  }
  roleSelected(event: any): void{
    if(!this.editMode || !this.firstTime){
      this.permissionList = [];
      this.permissions = [];
    }
    this.role.patchValue(event);
    this.getPermissionByRole();
  }
  permissionChange(permission: any, event: any): void{
    const customRole = this.roleList.find((r: any) => r.name === 'Custom Role');
    if (event.checked){
      this.permissions.push(permission.id);
      this.role.patchValue(customRole);
    }
    else{
      const index = this.permissions.findIndex((p: any) => p === permission.id);
      this.permissions.splice(index, 1);
      this.role.patchValue(customRole);
    }
  }
  isFormValid(): boolean{
    let result = true;
    if (this.owner.value && this.role.value){
      result = false;
    }
    return result;
  }
  onCancel(): void{
    this.dialogRef.close({});
  }
  onSubmit(): void{
    if (!this.isFormValid()){
      const data: any = {
        projectId: this.projectId,
        userId: this.owner.value.id,
        userRole: this.role.value.name,
        permissionList: this.permissions
      };
      let url = '/api/Project/AddSharedUserToAProject';
      if (this.editMode){
        data.projectShareId = this.selected.projectShareId;
        data.describe = this.description.value;
        url = '/api/ProjectShare/EditSharedUserToAProject';
      }
      else{
        data.createdOn = moment().utc().format();
        data.createdById = this.authService.userId;
        data.desc = this.description.value;
      }
      this.loading = true;
      this.http.post(environment.baseURL + url, data).subscribe((a: any) => {
        this.loading = false;
        this.dialogRef.close({reload: true});
      }, (error: any) => {
        this.loading = false;
      });
    }
    else{
      this.snackbar.open('Please select team member and role', '', {
        duration: 3000,
        panelClass: 'snackbar-xerror',
        horizontalPosition: 'start',
      });
    }
  }

}
