import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  user!: User;
  userSubscription!: Subscription;

  constructor(
    private _authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.userSubscription = this._authService.user.subscribe(user => {
      this.user = user
    });    
  }
  
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  logout() {
    this._authService.logout();
  }
}
