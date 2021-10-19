import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { User } from 'src/app/shared/models/user.model';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
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
    private _authService: AuthService,
    private _firebaseAuth: AngularFireAuth,
    private _fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this._authService.enableLoadingSpinner();
    this._firestoreCollections.getUsers().subscribe(users => {
      this.users = users.map(e => {        
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as User
        }
      })        
      this._authService.disableLoadingSpinner();
      // no error
      this.errorMsgOnGetUsers = '';      
    }, error => {
      this._authService.disableLoadingSpinner();
      // error
      this.errorMsgOnGetUsers = error.message;
    });

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
    const name = formResult.value.name!;
    const userId = this.currentUser.uid!;
    const newInfo = {userId: userId, displayName: name};    
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
  }
}
