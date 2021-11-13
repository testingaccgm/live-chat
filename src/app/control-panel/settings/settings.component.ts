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
        this._router.navigate(['/control-panel/settings/users']);
      };
    });   
  }

  ngOnDestroy(): void {
    this.userSubscirption.unsubscribe();
  }
}
