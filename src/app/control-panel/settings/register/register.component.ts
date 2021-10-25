import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Domain } from 'src/app/shared/models/domains.model';
import { RolesService } from '../roles.service';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  signupForm!: FormGroup;
  errorMsgOnLoadPhoneCodes!: string;

  roles = this._roleService.defaultRoles;
  rolesArray!: FormArray;

  domains!: Domain[];
  private _domainsSubscription!: Subscription;
  errorOnGetDomains!: string;
  private _errorOnGetDomainsSubscription!: Subscription;
  domainsArray!: FormArray;

  errorAuthMsg!: string;
  private _errorAuthMsgSubscription!: Subscription;

  errorOnSetUserData!: string;
  private _errorOnSetUserDataSubscription!: Subscription;

  isLoading!: boolean;
  private _isLoadingSubscription!: Subscription;

  constructor(
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _roleService: RolesService,
    private _firestoreCollections: FirestoreCollectionsService
  ) {}

  ngOnInit(): void {
    this.signupForm = this._formBuilder.group({
        name: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        email: [null, [Validators.required, Validators.email]],
        password: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
        confirmPass: [null, [Validators.required]],
        roles: this._formBuilder.array([]),
        domains: this._formBuilder.array([]),
      },
      {
        validator: this.confirmPasswordMatcher('password', 'confirmPass'),
      }
    );
    
    this.rolesArray = <FormArray> this.signupForm.get('roles');
    this.domainsArray = <FormArray> this.signupForm.get('domains');

    for (const role of this.roles) {
      this.rolesArray.push(new FormControl(
        {
          name: role.name,
          value: role.value,
          route: role.route,
          checked: role.checked
        }
      ));
    };

    this._firestoreCollections.getDomains();
    this._domainsSubscription = this._firestoreCollections.domainsSubject.subscribe(domains => {
      this.domains = domains;
    });

    this._errorOnGetDomainsSubscription = this._firestoreCollections.errorOnGetDomainsSubject.subscribe(error => {
      this.errorOnGetDomains = error;
    });

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
    this._domainsSubscription.unsubscribe();
    this._errorOnGetDomainsSubscription.unsubscribe();
    this._firestoreCollections.domainsUnsubscribe();

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

  onRoleChange(event: any, index: number) {
    if (event.target.checked) {
      this.rolesArray.value[index].checked = true;
    } else {
      this.rolesArray.value[index].checked = false;
    };
  };

  onSubmit(signupForm: FormGroup) {
    if (signupForm.invalid) {
      return;
    };

    const name = signupForm.value.name;
    const email = signupForm.value.email;
    const password = signupForm.value.password;
    const roles = signupForm.value.roles;
    const domains = signupForm.value.domains;
    const active = true;

    const newUser: User = {
      name,
      email,
      password,
      roles,
      domains,
      active
    };

    this._authService.signUp(newUser);
  };

  onDomainChange(event: any) {
    if (event.target.checked) {
      this.domainsArray.push(new FormControl({
        description: event.target.name,
        key: event.target.value
      }));
    } else {
      let i: number = 0;
      this.domainsArray.controls.forEach(item => {
        if (item.value == event.target.value) {
          this.domainsArray.removeAt(i);
          return;
        }
        i++;
      });
    };    
  };
}
