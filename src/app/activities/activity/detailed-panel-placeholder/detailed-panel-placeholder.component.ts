import {Component, OnInit, Input, ChangeDetectorRef} from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'xcdrs-detailed-panel-placeholder',
  templateUrl: './detailed-panel-placeholder.component.html',
  styleUrls: ['./detailed-panel-placeholder.component.scss']
})
export class DetailedPanelPlaceholderComponent implements OnInit {
  @Input() title: any;
  @Input() subTitle: any;
  @Input() imagePath: string;
  @Input() smallSize = false;
  @Input() imageWidth = '';
  @Input() isFromScoreCard: boolean = false;
  @Input() boardId:any;
  @Input() boardName:any;
  @Input() boardType:any;
  @Input() activeListLabel:any;
  @Input() activeList:any;

  public customStyle: any = {};
  labelTitle:String = '';
  keyResultLabl: string = '';

  constructor(private _router: Router, private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    if (this.imageWidth !== '') {
      this.customStyle.width = this.imageWidth;
    }
   this.labelTitle = this.activeListLabel ? this.activeListLabel.replace('.', '') : '';
   this.keyResultLabl = this.activeListLabel ? this.activeListLabel.replace('.', '') : '';
  }

 

  addAction() {
    let url = `/pages/scoreCard/board/${this.boardId}/${this.boardName}/${this.boardType}/add`;
    this._router.navigate([url]);
  }

}
