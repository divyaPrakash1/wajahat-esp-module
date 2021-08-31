import {
  Component,
  ElementRef,
  AfterViewInit,
  HostListener,
  OnInit,
} from "@angular/core";
import { SCREEN_SIZE } from "../../enums/shared.enums";
import { ResizeService } from "../../services/resize.service";
//import { SCREEN_SIZE } from "../../../shared/shared.enums";

@Component({
  selector: "xcdrs-size-detector",
  templateUrl: "./size-detector.component.html",
  styleUrls: ["./size-detector.component.scss"],
})
export class SizeDetectorComponent implements OnInit, AfterViewInit {
  prefix = "is-";
  sizes = [
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
    private resizeSvc: ResizeService
  ) {}

  @HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }
  ngOnInit(): void {}
  ngAfterViewInit(): void {
    this.detectScreenSize();
  }

  private detectScreenSize() {
    const currentSize = this.sizes.find((x) => {
      const el = this.elementRef.nativeElement.querySelector(
        `.${this.prefix}${x.id}`
      );
      const isVisible = window.getComputedStyle(el).display != "none";

      return isVisible;
    });

    this.resizeSvc.onResize(currentSize!.id);
  }
}
