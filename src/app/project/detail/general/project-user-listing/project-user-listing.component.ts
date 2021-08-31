import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-project-user-listing',
  templateUrl: './project-user-listing.component.html',
  styleUrls: ['./project-user-listing.component.scss']
})
export class ProjectUserListingComponent implements OnInit {
  @Input() users: any;
  @Output() onedit = new EventEmitter<any>();
  @Output() ondelete = new EventEmitter<any>();
  @Output() onadd = new EventEmitter<any>();
  @Output() onuser = new EventEmitter<any>();


  constructor() {
  }

  ngOnInit(): void {
  }
  onEditUser(user: any): void {
    this.onedit.emit(user);
  }
  onDeleteUser(user: any): void {
    this.ondelete.emit(user);
  }
  onAddClick(): void {
    this.onadd.emit();
  }
  onUserDetail(user: any): void {
    this.onuser.emit(user);
  }

}
