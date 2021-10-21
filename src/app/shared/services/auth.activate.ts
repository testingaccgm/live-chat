import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, Subscription } from 'rxjs';

import { User } from '../models/user.model';

@Injectable({providedIn: 'root'})
export class AuthActivate implements CanActivate {
  user!: User;
  userSubscription!: Subscription;
  
  constructor(
    private _router: Router,
    private _firebaseAuth: AngularFireAuth
  ){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const { autenticationRequired, autenticationFailureRedirectUrl, role } = route.data;

    return new Promise((resolve, reject) => {
      this.userSubscription = this._firebaseAuth.authState.subscribe((user) => {
        console.log('11');
          if (autenticationRequired && user || !autenticationRequired && !user) {
            console.log('22');
            this.userSubscription.unsubscribe();
            return resolve(true);
          }
          console.log('33');
          this.userSubscription.unsubscribe();
          return this._router.navigate([autenticationFailureRedirectUrl]);
        }
      )
    });
  }
}