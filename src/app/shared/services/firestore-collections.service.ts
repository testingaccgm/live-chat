import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';

import { LoginHistory, User } from '../models/user.model';


@Injectable({ providedIn: 'root' })
export class FirestoreCollectionsService {

  constructor(
    private _firestore: AngularFirestore,
    private _storage: AngularFireStorage
  ) {}

  setUserData(newUser: User) {
    return this._firestore.collection('users').doc(newUser.uid).set({
      name: newUser.name,
      email: newUser.email,
      roles: newUser.roles,
      uid: newUser.uid
    });
  };

  getUserData(userEmail: string) {
    return this._firestore
    .collection('users', (data) => data.where('email', '==', userEmail))
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
  }
}
