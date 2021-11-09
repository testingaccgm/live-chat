import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  defaultRoles: Array<{name: string, value: string, route: string, checked: boolean}> = [
    {name: 'Users', value: 'users', route: 'users', checked: false},
    {name: 'Register', value: 'register', route: 'register', checked: false},
    {name: 'Blocked Users', value: 'blockedUsers', route: 'blocked-users', checked: true},
    {name: 'Account Settings', value: 'accountSettings', route: 'account-settings', checked: true},
    {name: 'Domain Options', value: 'domainOptions', route: 'domain-options', checked: false},
  ];
  
  constructor() { }
}