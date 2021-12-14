import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-requirement-advance-view',
  templateUrl: './requirement-advance-view.component.html',
  styleUrls: ['./requirement-advance-view.component.scss']
})
export class RequirementAdvanceViewComponent implements OnInit {
  @Input() searchKey: string;
  @Input() time: any;
  constructor() { }

  ngOnInit(): void {
  }

}
