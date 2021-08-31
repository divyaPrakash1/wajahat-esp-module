import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { Location } from '@angular/common';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {
  menuVisible = true;
  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {
    router.events.subscribe((val: any) => {
      if (val instanceof NavigationEnd && this.location.path() === '/project'){
        this.router.navigate(['project/list']);
      }
      let parm = this.activatedRoute.firstChild;
      if (parm){
        parm = parm.snapshot.params.id;
      }
      if (val instanceof NavigationEnd && parm && val.url.includes('project/' + parm + '/requirements')){
        this.menuVisible = false;
      }
      else{
        this.menuVisible = true;
      }
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn){
      this.router.navigate(['auth/logout']);
    }
  }
}
