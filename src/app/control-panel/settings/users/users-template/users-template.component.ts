import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { LoginHistory, User } from 'src/app/shared/models/user.model';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

@Component({
  selector: 'app-users-template',
  templateUrl: './users-template.component.html',
  styleUrls: ['./users-template.component.scss']
})
export class UsersTemplateComponent implements OnInit, OnDestroy {
  @Input() users!: User[];
  editUserForm!: FormGroup;

  resetPasswordPopUp: boolean = false;
  disabledResetPasswordButton: boolean = false;
  currentResetEmail!: string;

  errorMsgOnResetPassword!: string;

  searchParams!: string;

  loginHistory!: any;
  private _loginHistorySubscription!: Subscription;

  currentUser!: User;
 
  constructor(
    private _firestoreCollections: FirestoreCollectionsService,
    private _firebaseAuth: AngularFireAuth,
    private _fb: FormBuilder
  ) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
 
  }

  editUser(user: User) {
    this.currentUser = user;

    this.editUserForm = this._fb.group({
      name: [user.name, Validators.required],
      roles: this._fb.array([]),
      domains: this._fb.array([])
    });

    const rolesArray = <FormArray> this.editUserForm.get('roles');
    const domainsArray = <FormArray> this.editUserForm.get('domains');

    for (const role of user.roles!) {
      rolesArray.push(new FormControl(
        {
          checked: role.checked,
          name: role.name,
          route: role.route,
          value: role.value
        }
      ));
    };

    for (const domain of user.domains!) {
      domainsArray.push(new FormControl(
        {
          checked: domain.checked,
          description: domain.description,
          domain: domain.domain,
          key: domain.key
        }
      ));
    };
  };

  submitEditUserForm() {
    if(this.editUserForm.invalid) {
      return;
    };

    const name = this.editUserForm.value.name;
    const email = this.currentUser.email;
    const active = this.currentUser.active;
    const roles = this.editUserForm.value.roles;
    const domains = this.editUserForm.value.domains;
    const uid = this.currentUser.uid;
    const newInfo = { name, email, active, roles, domains, uid };    

    this._firestoreCollections.setUserData(newInfo, false).then(() => {
      this.editUserForm.reset();
      this.currentUser = undefined!;
    }, error => {

    })
  };

  resetEditUserForm() {
    this.currentUser = undefined!;
    this.editUserForm.reset();
  };

  onRoleChange(event: any, index: number) {
    if (event.target.checked) {
      this.editUserForm.value.roles[index].checked = true;
    } else {
      this.editUserForm.value.roles[index].checked = false;
    };    
  };

  onDomainChange(event: any, index: number) {
    if (event.target.checked) {
      this.editUserForm.value.domains[index].checked = true;
    } else {
      this.editUserForm.value.domains[index].checked = false;
    };      
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

  closeResetPasswordPopUp() {
    this.resetPasswordPopUp = false;
    this.disabledResetPasswordButton = false;
    this.currentResetEmail = '';
  };

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
}
