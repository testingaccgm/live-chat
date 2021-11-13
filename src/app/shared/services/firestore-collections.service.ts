import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import * as firebase from 'firebase/app';

import { BlockedUser } from '../models/blocked-user.model';
import { Chat } from '../models/chat.model';
import { Domain } from '../models/domains.model';
import { MenuOption } from '../models/menu-option.model';
import { LoginHistory, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class FirestoreCollectionsService {
  constructor(
    private _firestore: AngularFirestore,
    private _storage: AngularFireStorage
  ) {}

  setUserData(userInfo: User, newReg: boolean) {
    const usersCollection = this._firestore.collection('users').doc(userInfo.uid);
    return usersCollection.set({
      name: userInfo.name,
      email: userInfo.email,
      active: userInfo.active,
      roles: userInfo.roles,
      domains: userInfo.domains,
      uid: userInfo.uid
    }).then(() => {
      if(newReg) {
        return usersCollection.collection('loginHistory').doc(userInfo.uid).set({
          loginHistory: []
        });
      } else {
        return;
      }
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

  setDomain(userId: string, role: Domain) {
    return this._firestore.collection('users').doc(userId).update({
      domains: firebase.default.firestore.FieldValue.arrayUnion({
        domain: role.domain,
        description: role.description,
        checked: role.checked
      })
    })
  };

  deleteDomain(domainId: string) {
    return this._firestore.collection('domains').doc(domainId).delete();
  };

  deleteDomainItem(userID: string, domainObj: Domain) {
    return this._firestore
    .collection('users').doc(userID)
    .update({
      domains: firebase.default.firestore.FieldValue.arrayRemove(domainObj)
    })
  };

  addDomain(domain: Domain) {
    return this._firestore.collection('domains').add(domain);
  };

  getDomains() {
    return this._firestore.collection('domains').snapshotChanges();
  };

  setUserDomain(newUser: User) {
    return this._firestore.collection('users').doc(newUser.uid).set({
      name: newUser.name,
      email: newUser.email,
      active: newUser.active,
      roles: newUser.roles,
      domains: newUser.domains,
      uid: newUser.uid
    });
  };

  addMenuOptionItem(menuItemObj: MenuOption) {
    return this._firestore
    .collection('menuOptions').add(menuItemObj);
  };

  deleteMenuOptionItem(menuItemObj: MenuOption) {
    return this._firestore
    .collection('menuOptions').doc(menuItemObj.id).delete();
  };

  editMenuOptionItem(menuItemObj: MenuOption) {
    return this._firestore
    .collection('menuOptions').doc(menuItemObj.id).update({
      key: menuItemObj.key,
      description: menuItemObj.description,
      active: menuItemObj.active
    });
  };

  editMenuOptioImage(menuItemId: string, imgUrl: string) {
    return this._firestore
    .collection('menuOptions').doc(menuItemId).update({
      img: imgUrl
    });
  };

  getMenuOptions() {
    return this._firestore.collection('menuOptions').snapshotChanges();
  };

  getActiveMenuOptions() {
    return this._firestore.
    collection('menuOptions', (data) => data.where('active', '==', true)).
    snapshotChanges();
  };

  deleteItemFromFireStorage(url: string) {
    return this._storage.storage.refFromURL(url).delete();
  };

  addChat(chat: Chat, type: string) {
    return this._firestore.collection(chat.domain).doc(type)
    .collection(type).doc(chat.id).set(chat);
  };

  deleteChat(domain: string, chatId: string) {
    return this._firestore.collection(domain).doc('activeChats')
    .collection('activeChats').doc(chatId).delete();
  };

  getChat(domain: string, status: string, chatId: string) {
    return this._firestore.collection(domain).doc(status)
    .collection(status, (data) => data.where('id', '==', chatId))
    .snapshotChanges();
  };

  getChats(domain: string, status: string) {
    return this._firestore.collection(domain).doc(status)
    .collection(status).snapshotChanges();
  };

  acceptPendingChat(chat: Chat, operator: { operatorDisplayName: string, operatorEmail: string }) {
    return this._firestore.collection(chat.domain).doc('activeChats')
    .collection('activeChats').doc(chat.id).update({
      status: 'active',
      operatorDisplayName: operator.operatorDisplayName,
      operatorEmail: operator.operatorEmail
    })
  };

  getCurrentChats(domain: string, status: string) {
    return this._firestore.collection(domain).doc(status)
    .collection(status, (data) => data.where('status', '==', 'pending'))
    .snapshotChanges();
  };

  addMessage(
    chat: { chatId: string, domain: string, client?: string, operator?: string }, 
    chatFormObj: { message: string, time: firebase.default.firestore.Timestamp }
    ){
    if (chat.client != undefined) {
      return this._firestore.collection(chat.domain).doc('activeChats')
      .collection('activeChats').doc(chat.chatId).update({
        chatHistory: firebase.default.firestore.FieldValue.arrayUnion({
          client: chat.client,
          message: chatFormObj.message,
          time: chatFormObj.time
        })
      });
    } else {
      return this._firestore.collection(chat.domain).doc('activeChats')
      .collection('activeChats').doc(chat.chatId).update({
        chatHistory: firebase.default.firestore.FieldValue.arrayUnion({
          operator: chat.operator,
          message: chatFormObj.message,
          time: chatFormObj.time
        })
      });
    }
  };

  blockUserByIp(blockedUser: BlockedUser) {
    return this._firestore.collection('blockedUsers').add(blockedUser);
  };

  getBlockedUsersById(){
    return this._firestore.collection('blockedUsers').snapshotChanges();
  };

  deleteBlockedUser(blockedUserId: string) {
   return this._firestore.collection('blockedUsers').doc(blockedUserId).delete();
  };
}