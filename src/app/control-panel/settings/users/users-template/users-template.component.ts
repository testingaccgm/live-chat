import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { User } from 'src/app/shared/models/user.model';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';
import { RolesService } from '../../roles.service';

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

  currentRolesId!: string;
  changeRolesMode: boolean = true;
  roles = this._roleService.defaultRoles;

  searchParams!: string;

  constructor(
    private _firestoreCollections: FirestoreCollectionsService,
    private _firebaseAuth: AngularFireAuth,
    private _formBuilder: FormBuilder,
    private _roleService: RolesService
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

    this._firestoreCollections.updateUserParameter(newInfo).then(() => {

      // no error
    }, error => {
      // display error
    })
  };

  changeRolesSubmit(changeRolesForm: FormGroup, user: User) {
    console.log(changeRolesForm);
  };

  enableChangeRolesMode(user: User) {
    this.changeRolesMode = false;
    this.currentRolesId = user.uid!;
  }

  disableChangeRolesMode() {
    this.changeRolesMode = true;
    this.currentRolesId = '';
  }
}
