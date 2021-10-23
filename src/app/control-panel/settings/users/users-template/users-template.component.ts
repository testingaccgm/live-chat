import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { User } from 'src/app/shared/models/user.model';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

@Component({
  selector: 'app-users-template',
  templateUrl: './users-template.component.html',
  styleUrls: ['./users-template.component.scss']
})
export class UsersTemplateComponent implements OnInit {
  @Input() users!: User[];

  errorMsgOnGetUsers!: string;
  errorMsgOnResetPassword!: string;

  resetPasswordPopUp: boolean = false;
  disabledResetPasswordButton: boolean = false;
  
  ChangeDisplayNameForm!: FormGroup;
  editDIsplayNameMode: boolean = false;
  currentDisplayNameId!: string;

  currentResetEmail!: string;

  // currentRoles!: Array<{name: string, value: string, route: string, checked: boolean}>;
  currentRolesUser!: User;
  currentRolesId!: string;
  changeRolesMode: boolean = true;

  searchParams!: string;

  constructor(
    private _firestoreCollections: FirestoreCollectionsService,
    private _firebaseAuth: AngularFireAuth,
    private _formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.ChangeDisplayNameForm = this._formBuilder.group({
      name: [null, [Validators.required]]
    });
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
    this.ChangeDisplayNameForm.controls['name'].setValue(user.name);
  }

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
    this.ChangeDisplayNameForm.reset();
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
    // this.currentRolesUser = user;
    this.currentRolesId = user.uid!;
    // console.log(this.currentRoles);
  };

  cancelChangeRolesMode(userIndex: number) {
    // this.changeRolesMode = true;
    // this.users[userIndex].roles = this.currentRoles;
    // this.currentRolesId = '';
    // console.log(this.currentRoles);
    // this.currentRoles = [];
  };

  onRoleChange(event: any, roleIndex: number, userIndex: number) {
    if (event.target.checked) {
      this.users[userIndex].roles![roleIndex].checked = true;
    } else {
      this.users[userIndex].roles![roleIndex].checked = false;
    };    
  };

  submitRoles() {
    for (const role of this.currentRolesUser.roles!) {
      this._firestoreCollections.updateUserRoles(role , this.currentRolesId).then(() => {

      }, error => {
  
      })
    }
  };
}
