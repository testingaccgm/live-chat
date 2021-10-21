import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';

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

  roles: Array<{name: string, value: string, route: string, checked: boolean}> = [
    {name: 'Users', value: 'users', route: 'users', checked: false},
    {name: 'Register', value: 'register', route: 'register', checked: false},
    {name: 'Blocked Clients', value: 'blockedClients', route: 'blocked-clients', checked: true},
    {name: 'Account Settings', value: 'accountSettings', route: 'account-settings', checked: true},
    {name: 'Allowed Domains', value: 'allowedDomains', route: 'allowed-domains', checked: false}
  ];
  rolesArray!: FormArray;

  constructor(
    private _formBuilder: FormBuilder,
    private _authService: AuthService
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

    this.rolesArray = this.signupForm.get('roles') as FormArray;

    for (const role of this.roles) {
      if(role.checked) {
        this.rolesArray.push(new FormControl(
          {
            name: role.name,
            value: role.value,
            route: role.route
          }
        ));
      }
    };

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
    if(event.target.checked) {
      this.rolesArray.push(new FormControl(
        {
          name: event.target.name,
          value: event.target.value,
          route: event.target.dataset.route
        }
      ));
    } else {
      let index: number = 0;
      this.rolesArray.controls.forEach(item => {
        if (item.value.value == event.target.value) { 
          this.rolesArray.removeAt(index);
          return;
        }
        index++;
      })
    } 
  };

  onSubmit(signupForm: FormGroup) {
    if (signupForm.invalid) {
      return;
    };

    const name = signupForm.value.name;
    const email = signupForm.value.email;
    const password = signupForm.value.password;
    const roles = signupForm.value.roles;
    const active = true;

    const newUser: User = {
      name,
      email,
      password,
      roles,
      active
    };
    
    this._authService.signUp(newUser);
  }
}