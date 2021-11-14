import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  user: User = undefined!;
  userSubscirption!: Subscription;

  constructor(
    private _authService: AuthService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this.userSubscirption = this._authService.user.subscribe(user => {
      this.user = user;
      if (this.user != undefined) {
        const activeRoute = JSON.parse(localStorage.getItem('operator/activeRoute')!);        

        if (activeRoute) {
          new Promise<void>((resolve, reject) => {
            for (let i = 0; i < this.user.roles!.length; i++) {
              if (activeRoute == this.user.roles![i].route && this.user.roles![i].checked) {
                this._router.navigate(['/control-panel/settings/' + activeRoute]);
                return;
              }
              if (i == this.user.roles!.length-1) {
                resolve();
              }
            }
          }).then(() => {
            this.setRoute();
          })
        } else {
          this.setRoute();
        };
      };
    });   
  };

  ngOnDestroy(): void {
    this.userSubscirption.unsubscribe();
  };

  setRoute() {
    for (const activeRole of this.user.roles!) {
      if (activeRole.checked) {
        this._router.navigate(['/control-panel/settings/' + activeRole.route]);
        localStorage.setItem('operator/activeRoute', JSON.stringify(activeRole.route));
        return;
      }
    };
  };

  setActiveRoute(route: string) {
    localStorage.setItem('operator/activeRoute', JSON.stringify(route));
  };
}
