import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';

import { LoginHistory, Roles, User } from '../models/user.model';


@Injectable({ providedIn: 'root' })
export class FirestoreCollectionsService {

  constructor(
    private _firestore: AngularFirestore
  ) {}

  setUserData(newUser: User) {
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

  getUsers() {
    return this._firestore
    .collection('users').snapshotChanges();
  };

  setUserIPAddress(userLocation: LoginHistory) {
    return this._firestore
    .collection('users').doc(userLocation.uid).update({
      loginHistory: firebase.default.firestore.FieldValue.arrayUnion({
        date: userLocation.date,
        ip: userLocation.ip,
        id: userLocation.id,
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

  updateUserRoles(roles: Roles, uid: string) {
    return this._firestore
    .collection('users').doc(uid).update({
      roles: firebase.default.firestore.FieldValue.arrayUnion({
        checked: roles.checked,
        name: roles.name,
        route: roles.route,
        value: roles.value
      })
    })
  };
}
