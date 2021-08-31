import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { AuthService } from 'src/app/shared/services/auth.service';
import { ProfilePicture } from 'src/app/shared/users/user-image';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-confirmation-dailog',
  templateUrl: './confirmation-dailog.component.html',
  styleUrls: ['./confirmation-dailog.component.scss']
})
export class ConfirmationDailogComponent implements OnInit {
  @Input() title: any;
  @Input() description: any;
  @Output() yes = new EventEmitter<any>();
  @Output() no = new EventEmitter<any>();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private profilePicture: ProfilePicture,
    private snackbar: MatSnackBar
  ){}

  ngOnInit(): void {
    if(!this.title){
      this.title = 'Delete';
    }
    if(!this.description){
      this.description = 'Are you sure to delete?';
    }
  }

  onYes(event: any): void{
    this.yes.emit();
  }
  onNo(event: any): void{
    this.yes.emit();
  }

}
