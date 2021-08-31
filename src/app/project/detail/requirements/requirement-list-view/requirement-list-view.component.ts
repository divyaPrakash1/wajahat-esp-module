import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-requirement-list-view',
  templateUrl: './requirement-list-view.component.html',
  styleUrls: ['./requirement-list-view.component.scss']
})
export class RequirementListViewComponent implements OnInit {
  @Input() list: any;
  @Output() expend = new EventEmitter<any>();

  expended = 0;

  constructor() { }

  ngOnInit(): void {
  }
  OnExpend(id: any): void{
    this.expended = this.expended === id ? 0 : id;
  }
}
