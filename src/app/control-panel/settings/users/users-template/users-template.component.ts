import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Domain } from 'src/app/shared/models/domains.model';
import { LoginHistory, User } from 'src/app/shared/models/user.model';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

@Component({
  selector: 'app-users-template',
  templateUrl: './users-template.component.html',
  styleUrls: ['./users-template.component.scss']
})
export class UsersTemplateComponent implements OnInit, OnDestroy {
  @Input() users!: User[];

  errorMsgOnGetUsers!: string;
  errorMsgOnResetPassword!: string;

  resetPasswordPopUp: boolean = false;
  disabledResetPasswordButton: boolean = false;
  
  changeDisplayNameForm!: FormGroup;
  editDIsplayNameMode: boolean = false;
  currentDisplayNameId!: string;

  currentResetEmail!: string;

  currentRolesUser!: User;
  changeRolesMode: boolean = true;

  searchParams!: string;

  loginHistory!: any;
  private _loginHistorySubscription!: Subscription;

  domains!: Domain[];
  private _domainsSubscription!: Subscription;
  errorOnGetDomains!: string;
  private _errorOnGetDomainsSubscription!: Subscription;
  currentDomainUser!: User;
  changeDomainMode: boolean = true;

  constructor(
    private _firestoreCollections: FirestoreCollectionsService,
    private _firebaseAuth: AngularFireAuth,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.changeDisplayNameForm = this._formBuilder.group({
      name: [null, [Validators.required]]
    });

    this._firestoreCollections.getDomains();
    this._domainsSubscription = this._firestoreCollections.domainsSubject.subscribe(domains => {
      this.domains = domains;
    });

    this._errorOnGetDomainsSubscription = this._firestoreCollections.errorOnGetDomainsSubject.subscribe(error => {
      this.errorOnGetDomains = error;
    });
  }

  ngOnDestroy(): void {
    this._domainsSubscription.unsubscribe();
    this._errorOnGetDomainsSubscription.unsubscribe();
    this._firestoreCollections.domainsUnsubscribe();
  }

  resetPassword(email: string) {
    //loading spinner  
    this.disabledResetPasswordButton = true;
    this.currentResetEmail = email;

    this._firebaseAuth.sendPasswordResetEmail(this.currentResetEmail).then(() => {         
      this.resetPasswordPopUp = true;      
      this.errorMsgOnResetPassword = '';
      // remove loading spinner
    }, error => {      
      this.errorMsgOnResetPassword = error.message;
      this.disabledResetPasswordButton = false;
      // remove loading spinner
    })
  };

  closeResetPasswordPopUp() {
    this.resetPasswordPopUp = false;
    this.disabledResetPasswordButton = false;
    this.currentResetEmail = '';
  };

  enableEditDisplayNameMode(user: User) {
    this.editDIsplayNameMode = true;
    this.currentDisplayNameId = user.uid!;
    this.changeDisplayNameForm.controls['name'].setValue(user.name);
  };

  editDisplayName(formResult: FormGroup) {
    if (formResult.invalid) {
      return;
    }

    const userId = this.currentDisplayNameId;
    const displayName = formResult.value.name!;
    const newInfo = {userId, displayName};

    this._firestoreCollections.updateUserDisplayName(newInfo).then(() => {
      this.resetDisplayNameFormFun();
      // no error
    }, error => {
      // display error
    })
  };

  resetDisplayNameFormFun() {
    this.editDIsplayNameMode = false;
    this.changeDisplayNameForm.reset();
    this.currentDisplayNameId = '';
  };

  changeAccountActivity(uid: string, param: boolean) {
    const userId = uid;
    const parameter = param;
    const newInfo = {userId, parameter};

    this._firestoreCollections.updateUserActivity(newInfo).then(() => {

      // no error
    }, error => {
      // display error
    })
  };

  enableChangeRolesMode(user: User) {
    this.changeRolesMode = false;
    this.currentRolesUser = user;
  };

  onRoleChange(event: any, roleIndex: number) {
    if (event.target.checked) {
      this.currentRolesUser.roles![roleIndex].checked = true;
    } else {
      this.currentRolesUser.roles![roleIndex].checked = false;
    };    
  };

  submitRoles() {
    this._firestoreCollections.setUserRoles(this.currentRolesUser).then(() => {
      this.currentRolesUser = undefined!;
      this.changeRolesMode = true;
      // no error
    }, error => {
      // error
    })
  };

  getUserLogins(userId: string) {
    this._loginHistorySubscription = this._firestoreCollections.getUserLogins(userId).subscribe(logins => {
      this.loginHistory = logins.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as LoginHistory
        }
      })      
    })
  };

  closeLogins() {
    this.loginHistory = undefined!;
    this._loginHistorySubscription.unsubscribe();
  };

  onDomainChange(event: any, domainIndex: number) {
    if (event.target.checked) {
      this.currentDomainUser.domains![domainIndex].checked = true;
    } else {
      this.currentDomainUser.domains![domainIndex].checked = false;
    };    
  };

  enableChangeDomainMode(user: User) {
    this.changeDomainMode = true;
    this.currentDomainUser = user;
  };

  submitDomain() {
    this._firestoreCollections.setUserDomain(this.currentDomainUser).then(() => {
      this.changeDomainMode = false;
      this.currentDomainUser = undefined!;
      // no error
    }, error => {
      // error
    })
  };
}
