import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';

@Injectable({providedIn: 'root'})
export class RoleActive implements CanActivate {
  constructor(
    private _router: Router,
    private _authService: AuthService
  ){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const { role, autenticationFailureRedirectUrl } = route.data;

    return new Promise((resolve, reject) => {
      this._authService.user.subscribe(user => {
        if (user != undefined) {
          for (const allowedRole of user.roles!) {
            if(role == allowedRole.value) {
              return resolve(true)
            }
          }
          return this._router.navigate([autenticationFailureRedirectUrl]);
        }
      });
    });
  }
}