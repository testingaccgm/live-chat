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
  
  currentUser!: User;

  ChangeDisplayName!: FormGroup;
  editDIsplayNameMode: boolean = false;

  searchParams!: string;

  changeRolesForm!: FormGroup;
  changeRolesMode: boolean = false;

  roles = this._roleService.roles;

  constructor(
    private _firestoreCollections: FirestoreCollectionsService,
    private _firebaseAuth: AngularFireAuth,
    private _formBuilder: FormBuilder,
    private _roleService: RolesService
  ) { }

  ngOnInit(): void {
    this.ChangeDisplayName = this._formBuilder.group({
      name: [null, [Validators.required]]
    });
  }

  resetPassword(user: User) {
    //loading spinner  
    this.disabledResetPasswordButton = true;
    this.currentUser = user;

    this._firebaseAuth.sendPasswordResetEmail(user.email).then(() => {         
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
    this.currentUser = undefined!;
  };

  enableEditDisplayNameMode(user: User) {
    this.editDIsplayNameMode = true;
    this.currentUser = user;
  }

  editDisplayName(formResult: FormGroup) {
    const userId = this.currentUser.uid!;
    const displayName = formResult.value.name!;
    const newInfo = {userId, displayName};

    this._firestoreCollections.updateUserDisplayName(newInfo).then(() => {
      this.resetDisplayNameForm();
      // no error
    }, error => {
      // display error
    })
  };

  resetDisplayNameForm() {
    this.ChangeDisplayName.reset();
    this.currentUser = null!;
    this.currentUser = undefined!;
    this.editDIsplayNameMode = false;
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

  changeRoles() {

  };

  changeRolesSubmit(changeRolesForm: FormGroup, user: User) {
    console.log(changeRolesForm);
  };

  enableChangeRolesMode() {
    this.changeRolesMode = true;
    this.changeRolesForm = this._formBuilder.group({
      
    });
  }
}
