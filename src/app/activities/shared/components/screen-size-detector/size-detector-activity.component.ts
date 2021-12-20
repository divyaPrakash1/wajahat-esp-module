import {
  Component,
  ElementRef,
  AfterViewInit,
  HostListener,
  OnInit,
} from "@angular/core";
import { SCREEN_SIZE } from "../../../shared/shared-activity.enums";
import { ActivityResizeService } from "../../../shared/services/resize-activity.service";

@Component({
  selector: "xcdrs-activity-size-detector",
  templateUrl: "size-detector-activity.component.html",
  styleUrls: ["size-detector-activity.component.scss"],
})
export class ActivitySizeDetectorComponent implements AfterViewInit {
  prefix = "is-";
  public sizes:any [] = [
    {
      id: SCREEN_SIZE.XS,
      name: "xs",
      css: `d-block d-sm-none`,
    },
    {
      id: SCREEN_SIZE.SM,
      name: "sm",
      css: `d-none d-sm-block d-md-none`,
    },
    {
      id: SCREEN_SIZE.MD,
      name: "md",
      css: `d-none d-md-block d-lg-none`,
    },
    {
      id: SCREEN_SIZE.LG,
      name: "lg",
      css: `d-none d-lg-block d-xl-none`,
    },
    {
      id: SCREEN_SIZE.XL,
      name: "xl",
      css: `d-none d-xl-block`,
    },
  ];

  constructor(
    private elementRef: ElementRef,
    private resizeSvc: ActivityResizeService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }
  ngAfterViewInit(): void {
    this.detectScreenSize();
  }

  private detectScreenSize() {
    const currentSize = this.sizes.find((x) => {
      const el = this.elementRef.nativeElement.querySelector(
        `.${this.prefix}${x.id}`
      );
      let isVisible;
      if(el) {
        isVisible = window.getComputedStyle(el).display != "none";
      }

      return isVisible;
    });
    if(currentSize && currentSize.id) {
      this.resizeSvc.onResize(currentSize.id);
    }
  }
}
