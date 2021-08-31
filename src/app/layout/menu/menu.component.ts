import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  menuActive = false;
  constructor() {
  }

  ngOnInit(): void {
  }
  isLoggedIn(): boolean {
    return  true;
  }
  clickMobileMenu(): void {
    this.menuActive = !this.menuActive;
  }

}
