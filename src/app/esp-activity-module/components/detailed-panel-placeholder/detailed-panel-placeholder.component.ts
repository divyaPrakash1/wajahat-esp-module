import {Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'xcdrs-detailed-panel-placeholder',
  templateUrl: './detailed-panel-placeholder.component.html',
  styleUrls: ['./detailed-panel-placeholder.component.scss']
})
export class DetailedPanelPlaceholderComponent implements OnInit {
  @Input() title!: string;
  @Input() subTitle!: string;
  @Input() imagePath!: string;
  @Input() smallSize = false;
  @Input() imageWidth = '';
  public customStyle: any = {};

  constructor() {
  }

  ngOnInit() {
    if (this.imageWidth !== '') {
      this.customStyle.width = this.imageWidth;
    }
  }

}
