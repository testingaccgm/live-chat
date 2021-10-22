import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { AuthService } from './auth.service';

@Injectable({providedIn: 'root'})
export class RoleActive implements CanActivate {
  userSubscription!: Subscription;

  constructor(
    private _router: Router,
    private _authService: AuthService
  ){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const { role, autenticationFailureRedirectUrl } = route.data;

    return new Promise((resolve, reject) => {
      this.userSubscription = this._authService.user.subscribe(user => {
        if (user !== undefined && user !== null) {
          for (let allowedRole of user.roles!) {
            if(role == allowedRole.value) {
              if (this.userSubscription !== undefined) {
                this.userSubscription.unsubscribe();
              }
              return resolve(true)
            }
          }
          this.userSubscription.unsubscribe();
          return this._router.navigate([autenticationFailureRedirectUrl]);
        };

        if (user == null && this.userSubscription) {
          this.userSubscription.unsubscribe();
        }
      });
    });
  }
}