import { Component, OnInit } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ProjectDetailService } from '../../detail.service';
import { isEmpty } from 'lodash';
import { ProfilePicture } from 'src/app/shared/users/user-image';
import { MatDialog } from '@angular/material/dialog';
import { AddProjectUserComponent } from '../add-project-user/add-project-user.component';
import { ProjectUserDeleteComponent } from '../project-user-delete/project-user-delete.component';
import { ProjectUserDetailComponent } from '../project-user-detail/project-user-detail.component';

@Component({
  selector: 'app-project-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  loading = true;
  userList: Array<any> = [];
  isAddOpen = false;
  projectDetail: any = {};
  userEdit: any = {};
  isDeleteUser = false;

  constructor(
    private http: HttpClient,
    private detailService: ProjectDetailService,
    private profilePicture: ProfilePicture,
    public dialog: MatDialog,
  ) {
    this.detailService.getDetail.subscribe((d: any) => {
      if (!isEmpty(d)){
        this.projectDetail = d;
      }
    });
  }

  ngOnInit(): void {
    this.getUsersForProject();
  }
  getUsersForProject(): void {
    this.loading = true;
    // tslint:disable-next-line: max-line-length
    this.http.post(environment.baseURL + '/api/ProjectShare/GetUsersSharedWithProject', {
      ProjectId: this.projectDetail.projectId,
      PageNo: 0,
      PageSize: 4,
      search: ''
    }).subscribe((results: any) => {
      this.userList = results.result.map((user: any) => {
        user.isOwner = user.role === 'Project Owner';
        // .permissions.some((p: any) => p.permissionTitle === 'Project Owner');
        user.fullName = user.userFirstName + ' ' + user.userLastName;
        if (!user.userProfilePicture || user.userProfilePicture === ''){
          user.userProfilePicture = this.profilePicture.generate(user.userFirstName, user.userLastName);
        }
        console.log(user);
        return user;
      });
      this.loading = false;
    }, error => {
      this.loading = false;
    });
  }

  onAddUser(): void{
    const addUserDialog = this.dialog.open(AddProjectUserComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: 'tag-popup-dailog',
      data: {
        projectid : this.projectDetail.projectId
      }
    });
    addUserDialog.afterClosed().subscribe((result: any) => {
      if (result && result.reload){
        this.getUsersForProject();
      }
    });
  }
  onEditUser(user: any): void{
    const addUserDialog = this.dialog.open(AddProjectUserComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: 'tag-popup-dailog',
      data: {
        projectid : this.projectDetail.projectId,
        selected: user
      }
    });
    addUserDialog.afterClosed().subscribe((result: any) => {
      if (result && result.reload){
        this.getUsersForProject();
      }
    });
  }
  onDeleteUser(user: any): void{
    const addUserDialog = this.dialog.open(ProjectUserDeleteComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: 'tag-popup-dailog',
      data: {user}
    });
    addUserDialog.afterClosed().subscribe((result: any) => {
      if (result && result.reload){
        this.getUsersForProject();
      }
    });
  }
  onDetailUser(user: any): void{
    const addUserDialog = this.dialog.open(ProjectUserDetailComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: 'tag-popup-dailog',
      data: {user}
    });
    addUserDialog.afterClosed().subscribe((result: any) => {
      if (result && result.reload){
        this.getUsersForProject();
      }
      else if (result && result.action === 'delete'){
        this.onDeleteUser(result.user);
      }
      else if (result && result.action === 'edit'){
        this.onEditUser(result.user);
      }
    });
  }

  openAttachmentPopup(event: any) : void{

  }


}
