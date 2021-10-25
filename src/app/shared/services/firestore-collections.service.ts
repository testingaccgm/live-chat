import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Domain } from '../models/domains.model';

import { LoginHistory, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class FirestoreCollectionsService {
  domains!: Domain[];
  domainsSubject = new BehaviorSubject<Domain[]>(undefined!);
  errorOnGetDomainsSubject = new BehaviorSubject<string>('');
  private _domainsSubscription!: Subscription;

  constructor(
    private _firestore: AngularFirestore
  ) {}

  setUserData(newUser: User) {
    const usersCollection = this._firestore.collection('users').doc(newUser.uid);
    return usersCollection.set({
      name: newUser.name,
      email: newUser.email,
      active: newUser.active,
      roles: newUser.roles,
      domains: newUser.domains,
      uid: newUser.uid
    }).then(() => {
      return usersCollection.collection('loginHistory').doc(newUser.uid).set({
        loginHistory: []
      });
    });
  };

  setUserRoles(newUser: User) {
    return this._firestore.collection('users').doc(newUser.uid).set({
      name: newUser.name,
      email: newUser.email,
      active: newUser.active,
      roles: newUser.roles,
      uid: newUser.uid
    });
  };

  getUserData(criteria : string, parameter: any) {
    return this._firestore
    .collection('users', (data) => data.where(criteria, '==', parameter))
    .snapshotChanges();
  };

  setUserIPAddress(userLocation: LoginHistory) {
    return this._firestore
    .collection('users').doc(userLocation.uid)
    .collection('loginHistory').doc(userLocation.uid)
    .update({
      loginHistory: firebase.default.firestore.FieldValue.arrayUnion({
        date: userLocation.date,
        ip: userLocation.ip,
        country: userLocation.country,
        city: userLocation.city
      })
    })
  };

  updateUserDisplayName(newInfo: {userId: string, displayName: string}) {
    return this._firestore
    .collection('users').doc(newInfo.userId).update({
      name: newInfo.displayName
    })
  };

  updateUserActivity(newInfo: {userId: string, parameter: any}) {
    return this._firestore
    .collection('users').doc(newInfo.userId).update({
      active: newInfo.parameter
    })
  };

  getUserLogins(userId: string) {
    return this._firestore.collection('users').doc(userId)
    .collection('loginHistory').snapshotChanges();
  };

  addDomain(domain: Domain) {
    return this._firestore.collection('domains').add(domain);
  };

  getDomains() {
    this._domainsSubscription = this._firestore.collection('domains')
    .snapshotChanges().subscribe(domains => {      
      this.domains = domains.map(e => {
        return {
          id: e.payload.doc.id,
          ... e.payload.doc.data() as Domain
        }
      });
      this.domainsSubject.next(this.domains);
      this.errorOnGetDomainsSubject.next('');
    }, error => {
      this.errorOnGetDomainsSubject.next(error.message);
    });
  };

  domainsUnsubscribe() {
    this._domainsSubscription.unsubscribe();
  };
}