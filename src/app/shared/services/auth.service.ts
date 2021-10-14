import { Injectable } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';

import { environment } from 'src/environments/environment';
import { LoginHistory, User } from '../models/user.model';
import { FirestoreCollectionsService } from './firestore-collections.service';
import { GenerateIdService } from './generate-id.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = new BehaviorSubject<User>(undefined!);
  userDbSubscription!: Subscription;

  userLocation = new LoginHistory ('', '' , '', '', '', null!);
  private _userLocationSubscription!: Subscription;

  errorAuthMsg: string = '';
  errorAuthMsgSubject = new BehaviorSubject<string>(this.errorAuthMsg);

  errorOnGetuserData: string = '';
  errorOnGetuserDataSubject = new BehaviorSubject<string>(this.errorOnGetuserData);

  errorOnSetUserData: string = '';
  errorOnSetUserDataSubject = new BehaviorSubject<string>(this.errorOnSetUserData);

  isLoading: boolean = false;
  isLoadingSubject = new BehaviorSubject<boolean>(this.isLoading);

  constructor(
    private _router: Router,
    private _firebaseAuth: AngularFireAuth,
    private _firestoreCollections: FirestoreCollectionsService,
    private _http: HttpClient,
    private _generateIdService: GenerateIdService
  ) { }

  signUp(newUser: User) {
    this.enableLoadingSpinner();
    this._firebaseAuth.createUserWithEmailAndPassword(newUser.email, newUser.password!)
    .then((user) => {
      newUser.uid = user.user!.uid;
      this._firestoreCollections.setUserData(newUser)
      .then(() => {
          this.subscribeForDbCollectionUser(newUser.email);
          this._router.navigate(['/home']);
          this.setUserIP();
          this.errorOnSetUserData = '';
          this.errorOnSetUserDataSubject.next(this.errorOnSetUserData);
        }, (error) => {
          this.errorOnSetUserData = error.message;
          this.errorOnSetUserDataSubject.next(this.errorOnSetUserData);
        }
      );
      this.errorAuthMsg = '';
      this.errorAuthMsgSubject.next(this.errorAuthMsg);
      this.disableLoadingSpinner();
    }, (error) => {
      this.errorAuthHandler(error);
      this.disableLoadingSpinner();
    });
  }

  signIn(email: string, password: string) {
    this.enableLoadingSpinner();
    this._firebaseAuth.signInWithEmailAndPassword(email, password)
    .then(() => {
        this.subscribeForDbCollectionUser(email);
        this._router.navigate(['/home']);
        this.setUserIP();
        this.errorAuthMsg = '';
        this.errorAuthMsgSubject.next(this.errorAuthMsg);
        this.disableLoadingSpinner();
      },
      (error) => {
        this.errorAuthHandler(error);
        this.disableLoadingSpinner();
      }
    );
  }

  logout() {
    this._firebaseAuth.signOut()
    .then(() => {
      this.userDbSubscription.unsubscribe();
      this.user.next(null!);
      this._router.navigate(['/signin']);
    });
  };

  autoLogin() {
    this._firebaseAuth.authState.subscribe((user) => {
      if (user && !this.userDbSubscription) {
        this.subscribeForDbCollectionUser(user.email!);
      } else {
        this.user.next(null!);
      }
    });
  };
  
  subscribeForDbCollectionUser(userEmail: string) {
    this.userDbSubscription = this._firestoreCollections.getUserData(userEmail).subscribe(
      (data) => {
        const userInfo = data.map((e) => {
          return {
            id: e.payload.doc.id,
            ...(e.payload.doc.data() as User),
          }
        });
        this.user.next(userInfo[0]);
        this.userLocation.uid = userInfo[0].uid!;
        this.errorOnGetuserData = '';
        this.errorOnGetuserDataSubject.next(this.errorOnGetuserData);
      }, (error) => {
        this.errorOnGetuserData = error.message;
        this.errorOnGetuserDataSubject.next(this.errorOnGetuserData);
      }
    );
  };


  setUserIP() {
    const promise = new Promise<void>((resolve, reject) => {
      this._userLocationSubscription = this._http.get("https://api.geoapify.com/v1/ipinfo?apiKey=" + environment.geoLocationAPIKey)
      .subscribe((res: any) => {
        if(res && this.userDbSubscription) {
          this.userLocation.country = res.country.name,
          this.userLocation.city = res.city.name,
          this.userLocation.ip = res.ip,
          this.userLocation.id = this._generateIdService.generateId(),
          this.userLocation.date = firebase.default.firestore.Timestamp.now();
          resolve();
        }
      });
    }).then(() => {      
      this._firestoreCollections.setUserIPAddress(this.userLocation).then(() => {
        this._userLocationSubscription.unsubscribe();
      }, (error) => {

      })
    })
  }

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
  }

  disableLoadingSpinner() {
    this.isLoading = false;
    this.isLoadingSubject.next(this.isLoading);
  }
}