import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'xcdrs-signin-propose',
  templateUrl: './signin-propose.component.html',
  styleUrls: ['./signin-propose.component.scss']
})
export class SigninProposeComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<SigninProposeComponent>) {
  }

  ngOnInit(): void {
  }

  proceed(path: string): void {
    this.dialogRef.close(path);
  }

  skip(): void {
    this.dialogRef.close(false);
  }

}
