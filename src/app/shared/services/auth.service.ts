import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';

import { environment } from 'src/environments/environment';
import { LoginHistory, User } from '../models/user.model';
import { FirestoreCollectionsService } from './firestore-collections.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = new BehaviorSubject<User>(undefined!);
  userDbSubscription!: Subscription;

  userLocation = new LoginHistory ('', '', '', '', null!);
  private _userLocationSubscription!: Subscription;
  setIP: boolean = false;

  errorAuthMsg: string = '';
  errorAuthMsgSubject = new BehaviorSubject<string>(this.errorAuthMsg);

  errorOnGetuserData: string = '';
  errorOnGetuserDataSubject = new BehaviorSubject<string>(this.errorOnGetuserData);

  errorOnSetUserData: string = '';
  errorOnSetUserDataSubject = new BehaviorSubject<string>(this.errorOnSetUserData);

  isLoading: boolean = false;
  isLoadingSubject = new BehaviorSubject<boolean>(this.isLoading);

  finishedReg: boolean = false;
  finishedRegSubject = new BehaviorSubject<boolean>(this.finishedReg);

  secondaryApp = firebase.default.initializeApp(environment.firebaseConfig, 'Secondary');

  constructor(
    private _router: Router,
    private _firebaseAuth: AngularFireAuth,
    private _firestoreCollections: FirestoreCollectionsService,
    private _http: HttpClient
  ) { }

  signUp(newUser: User) {
    this.enableLoadingSpinner();

    this.finishedReg = false;
    this.finishedRegSubject.next(this.finishedReg);
    
    this.secondaryApp.auth().createUserWithEmailAndPassword(newUser.email, newUser.password!)
    .then((user) => {
      newUser.uid = user.user!.uid;
      this._firestoreCollections.setUserData(newUser, true)
      .then(() => {
          this.secondaryApp.auth().signOut();
          this.errorOnSetUserData = '';
          this.errorOnSetUserDataSubject.next(this.errorOnSetUserData);
        }, (error) => {
          this.errorOnSetUserData = error.message;
          this.errorOnSetUserDataSubject.next(this.errorOnSetUserData);
        }
      );
      this.errorAuthMsg = '';
      this.errorAuthMsgSubject.next(this.errorAuthMsg);

      this.finishedReg = true;
      this.finishedRegSubject.next(this.finishedReg);

      this.disableLoadingSpinner();
    }, (error) => {
      this.errorAuthHandler(error);
      this.disableLoadingSpinner();
    })
  };

  signIn(email: string, password: string) {
    this.enableLoadingSpinner();
    this._firebaseAuth.signInWithEmailAndPassword(email, password)
    .then(() => {
        this.setIP = true;
        this.subscribeForDbCollectionUser(email);        
        this.errorAuthMsg = '';
        this.errorAuthMsgSubject.next(this.errorAuthMsg);
        this.disableLoadingSpinner();
      },
      (error) => {
        this.errorAuthHandler(error);
        this.disableLoadingSpinner();
      }
    )
  };

  logout() {
    this._firebaseAuth.signOut()
    .then(() => {
      this.userDbSubscription.unsubscribe();
      this.user.next(null!);
      this._router.navigate(['/control-panel/login']);
    })
  };

  autoLogin() {
    this._firebaseAuth.authState.subscribe((user) => {    
      if (user && !this.userDbSubscription) {
        this.subscribeForDbCollectionUser(user.email!);        
      } else {
        this.user.next(null!);
      }
    })
  };
  
  subscribeForDbCollectionUser(userEmail: string) {
    this.userDbSubscription = this._firestoreCollections.getUserData('email', userEmail).subscribe(
      (data) => {
        const userInfo = data.map((e) => {
          return {
            ...(e.payload.doc.data() as User),
          }
        });
        this.user.next(userInfo[0]);
        this.userLocation.uid = userInfo[0]?.uid!;

        if (!userInfo[0].active) {
          this.logout();
        }

        if (this.setIP) {
          this.setIP = false;
          this.setUserIP();
          this._router.navigate(['/control-panel/chats']);
        }

        this.errorOnGetuserData = '';
        this.errorOnGetuserDataSubject.next(this.errorOnGetuserData);
      }, (error) => {
        this.errorOnGetuserData = error.message;
        this.errorOnGetuserDataSubject.next(this.errorOnGetuserData);
      }
    )
  };

  setUserIP() {
    this._userLocationSubscription = this._http.get("https://api.geoapify.com/v1/ipinfo?apiKey=" + environment.geoLocationAPIKey)
    .subscribe((res: any) => {
      this.userLocation.country = res.country.name;
      this.userLocation.city = res.city.name;
      this.userLocation.ip = res.ip;
      this.userLocation.date = firebase.default.firestore.Timestamp.now();

      this._firestoreCollections.setUserIPAddress(this.userLocation).then(() => {        
        this._userLocationSubscription.unsubscribe();
      }, (error) => {
        // error
        this._userLocationSubscription.unsubscribe();
      })
    })
  };

  errorAuthHandler(error: any) {
    switch (error.code) {
      case 'auth/email-already-in-use': {
        this.errorAuthMsg = 'Already has a registration with this email!';
        this.errorAuthMsgSubject.next(this.errorAuthMsg);
        break;
      }
      case 'auth/user-not-found': {
        this.errorAuthMsg = 'Wrong email!';
        this.errorAuthMsgSubject.next(this.errorAuthMsg);
        break;
      }
      case 'auth/wrong-password': {
        this.errorAuthMsg = 'Wrong password!';
        this.errorAuthMsgSubject.next(this.errorAuthMsg);
        break;
      }
      default: {
        this.errorAuthMsg = 'Unknown Error';
        this.errorAuthMsgSubject.next(this.errorAuthMsg);
        break;
      }
    }
  };

  enableLoadingSpinner() {
    this.isLoading = true;
    this.isLoadingSubject.next(this.isLoading);
  };

  disableLoadingSpinner() {
    this.isLoading = false;
    this.isLoadingSubject.next(this.isLoading);
  };
}