import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  signinForm!: FormGroup;

  errorAuthMsg!: string;
  private _errorAuthMsgSubscription!: Subscription;

  errorOnGetuserData!: string;
  private _errorOnGetuserDataSubscription!: Subscription;

  isLoading!: boolean;
  private _isLoadingSubscription!: Subscription;

  constructor(private _authService: AuthService) {}

  ngOnInit(): void {
    this.signinForm = new FormGroup({
      email: new FormControl('test_user@gmail.com', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl('12345678', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(30),
      ]),
    });

    this._errorAuthMsgSubscription =
    this._authService.errorAuthMsgSubject.subscribe((error) => {
      this.errorAuthMsg = error;
    });
    
    this._errorOnGetuserDataSubscription =
    this._authService.errorOnGetuserDataSubject.subscribe((error) => {
      this.errorOnGetuserData = error;
    });

    this._isLoadingSubscription = this._authService.isLoadingSubject
    .subscribe((boolean) => {
      this.isLoading = boolean;
    })
  }

  ngOnDestroy(): void {
    this._errorAuthMsgSubscription.unsubscribe();
    this._errorOnGetuserDataSubscription.unsubscribe();
    this._isLoadingSubscription.unsubscribe();

    this._authService.errorAuthMsg = '';
    this._authService.errorAuthMsgSubject.next(this._authService.errorAuthMsg);
  }

  onSubmit(signinForm: FormGroup) {
    const email = signinForm.value.email;
    const password = signinForm.value.password;

    this._authService.signIn(email, password);
  }
}
