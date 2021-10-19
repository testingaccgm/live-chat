import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  signupForm!: FormGroup;
  errorMsgOnLoadPhoneCodes!: string;

  errorAuthMsg!: string;
  private _errorAuthMsgSubscription!: Subscription;

  errorOnSetUserData!: string;
  private _errorOnSetUserDataSubscription!: Subscription;

  isLoading!: boolean;
  private _isLoadingSubscription!: Subscription;

  roles: Array<{name: string, value: string}> = [
    {name: 'Users', value: 'users'},
    {name: 'Register', value: 'register'},
    {name: 'Blocked Clients', value: 'blockedClients'},
    {name: 'Account Settings', value: 'accountSettings'},
    {name: 'Allowed Domains', value: 'allowedDomains'}
  ];

  constructor(
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _firestoreCollections: FirestoreCollectionsService
  ) {}

  ngOnInit(): void {
    this.signupForm = this._formBuilder.group({
        name: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        email: [null, [Validators.required, Validators.email]],
        password: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
        confirmPass: [null, [Validators.required]],
        roles: this._formBuilder.array([])
      },
      {
        validator: this.confirmPasswordMatcher('password', 'confirmPass'),
      }
    );

    this._errorAuthMsgSubscription =
      this._authService.errorAuthMsgSubject.subscribe((error) => {
        this.errorAuthMsg = error;
    });
    
    this._errorOnSetUserDataSubscription =
    this._authService.errorOnSetUserDataSubject.subscribe((error) => {
      this.errorOnSetUserData = error;
    });

    this._isLoadingSubscription = this._authService.isLoadingSubject
    .subscribe((boolean) => {
      this.isLoading = boolean;
    });    
  }

  ngOnDestroy(): void {
    this._errorAuthMsgSubscription.unsubscribe();
    this._errorOnSetUserDataSubscription.unsubscribe();
    this._isLoadingSubscription.unsubscribe();

    this._authService.errorAuthMsg = '';
    this._authService.errorAuthMsgSubject.next(this._authService.errorAuthMsg);
  }

  confirmPasswordMatcher(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  };

  onRoleChange(event: any) {
    const roles: FormArray = this.signupForm.get('roles') as FormArray;

    if(event.target.checked) {
      roles.push(new FormControl(event.target.value));
    } else {
      let index: number = 0;
      roles.controls.forEach(item => {
        if (item.value == event.target.value) {
          roles.removeAt(index);
          return;
        }
        index++;
      })
    }
  };

  onSubmit(signupForm: FormGroup) {
    if (signupForm.invalid) {
      return;
    }

    const name = signupForm.value.name;
    const email = signupForm.value.email;
    const password = signupForm.value.password;
    const roles = signupForm.value.roles;

    const newUser: User = {
      name,
      email,
      password,
      roles
    };

    this._authService.signUp(newUser);
  }
}
