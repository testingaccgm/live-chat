import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordFrom!: FormGroup;
  changePasswordPopUp: boolean = false;
  changePasswordLogoutPopUp: boolean = false;

  errorOnChangePassword: string = '';

  isLoading: boolean = false;
  private _isLoadingSubscription!: Subscription;

  constructor(
    private _fb: FormBuilder,
    private _firebaseAuth: AngularFireAuth,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this.changePasswordFrom = this._fb.group({
      password: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      confirmPass: [null, [Validators.required]],
    },
    {
      validator: this.confirmPasswordMatcher('password', 'confirmPass'),
    });

    // this._isLoadingSubscription = 
  };

  confirmPasswordMatcher(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }
  };

  changePassword(changePasswordFrom: FormGroup) {
    if (changePasswordFrom.invalid) {
      return;
    }

    // this._authService.enableLoadingSpinner();    

    const password = changePasswordFrom.value.password;

    this._firebaseAuth.currentUser.then(user => {     
      user?.updatePassword(password).then(() => {
        this.changePasswordPopUp = true;
        changePasswordFrom.reset();
        this.errorOnChangePassword = '';
        // this._authService.disableLoadingSpinner();
      }, error => {
        this.changePasswordLogoutPopUp = true;
        this.errorOnChangePassword = error.message;
        // this._authService.disableLoadingSpinner();
      });
    });
  };

  closePasswordChangePopUp() {
    this.changePasswordPopUp = false;
  };

  logout() {
    this._authService.logout();
  }

  stayLogged() {
    this.changePasswordLogoutPopUp = false;
    this.errorOnChangePassword = '';
    this.changePasswordFrom.reset();
  }
}
