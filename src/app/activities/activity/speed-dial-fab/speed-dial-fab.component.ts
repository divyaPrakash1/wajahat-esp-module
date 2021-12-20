import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "xcdrs-speed-dial-fab",
  templateUrl: "./speed-dial-fab.component.html",
  styleUrls: ["./speed-dial-fab.component.scss"],
})
export class SpeedDialFabComponent implements OnInit {
  @Input() fabButtons: { id: number; name: string }[];
  @Output() clickedBtn: EventEmitter<{
    id: number;
    name: string;
  }> = new EventEmitter<{ id: number; name: string }>();
  buttons: { id: number; name: string }[] = [];
  fabTogglerState: string = "inactive";

  constructor() {}

  ngOnInit(): void {}

  showItems() {
    this.fabTogglerState = "active";
    this.buttons = this.fabButtons.reverse();
  }

  hideItems() {
    this.fabTogglerState = "inactive";
    this.buttons = [];
  }

  onToggleFab() {
    this.buttons.length ? this.hideItems() : this.showItems();
  }

  doFabAction(btn: { id: number; name: string }) {
    this.clickedBtn.emit(btn);
    this.hideItems();
  }

  onNoClick(): void {
    this.hideItems();
  }
}
