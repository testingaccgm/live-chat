import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {
  user!: User;
  userSubscirption!: Subscription;

  constructor(
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userSubscirption = this._authService.user.subscribe(user => {
      this.user = user;      
    });    
  }

  ngOnDestroy(): void {
    this.userSubscirption.unsubscribe();
  }
}
