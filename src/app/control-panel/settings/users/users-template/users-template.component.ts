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
  
  userEmail!: string;

  ChangeDisplayName!: FormGroup;
  editDIsplayNameMode: boolean = false;
  currentUser!: User;
  searchParams!: string;

  constructor(
    private _firestoreCollections: FirestoreCollectionsService,
    private _firebaseAuth: AngularFireAuth,
    private _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.ChangeDisplayName = this._fb.group({
      name: [null, [Validators.required]]
    });
  }

  resetPassword(email: string) {
    //loading spinner  
    this.disabledResetPasswordButton = true;
    this.userEmail = email;

    this._firebaseAuth.sendPasswordResetEmail(email).then(() => {         
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
    this.userEmail = '';
  };

  enableEditDisplayNameMode(user: User) {
    this.editDIsplayNameMode = true;
    this.currentUser = user;
    this.userEmail = user.email;
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
    this.userEmail = '';
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
}
