import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthActivate implements CanActivate {
  isAuth!: boolean;

  constructor(
    private _router: Router,
    private _firebaseAuth: AngularFireAuth
  ){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const { autenticationRequired, autenticationFailureRedirectUrl } = route.data;

    return new Promise((resolve, reject) => {
      this._firebaseAuth.authState.subscribe((user) => {
          if (autenticationRequired && user || !autenticationRequired && !user) {
            return resolve(true);
          }
          return this._router.navigate([autenticationFailureRedirectUrl]);
        }
      )
    });
  }
}