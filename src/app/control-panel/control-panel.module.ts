import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlPanelComponent } from './control-panel.component';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatsComponent } from './chats/chats.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { RegisterComponent } from './settings/register/register.component';
import { AuthActivate } from '../shared/services/auth.activate';
import { HeaderComponent } from './header/header.component';
import { SettingsComponent } from './settings/settings.component';
import { UsersComponent } from './settings/users/users.component';
import { BlockedClientsComponent } from './settings/blocked-clients/blocked-clients.component';
import { AccountSettingsComponent } from './settings/account-settings/account-settings.component';
import { AllowedDomainsComponent } from './settings/allowed-domains/allowed-domains.component';

@NgModule({
  declarations: [
    ControlPanelComponent,
    LoginComponent,
    ChatsComponent,
    RegisterComponent,
    HeaderComponent,
    SettingsComponent,
    UsersComponent,
    BlockedClientsComponent,
    AccountSettingsComponent,
    AllowedDomainsComponent    
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    FormsModule,
    RouterModule.forChild([
      {path: '', component: ControlPanelComponent,
        children: [
          {path: 'login', component: LoginComponent,
            canActivate: [AuthActivate],
            data: {
              autenticationRequired: false,
              autenticationFailureRedirectUrl: '/control-panel/settings',
            }
          },
          {path: 'chats', component: ChatsComponent,
            canActivate: [AuthActivate],
            data: {
              autenticationRequired: true,
              autenticationFailureRedirectUrl: '/control-panel/login',
            }
          },
          {path: 'settings', component: SettingsComponent,
            children: [
              {path: 'users', component: UsersComponent,
                canActivate: [AuthActivate],
                data: {
                  autenticationRequired: true,
                  autenticationFailureRedirectUrl: '/control-panel/login',
                }
              },
              {path: 'register', component: RegisterComponent,
                canActivate: [AuthActivate],
                data: {
                  autenticationRequired: true,
                  autenticationFailureRedirectUrl: '/control-panel/login',
                }
              },
              {path: 'blocked-clients', component: BlockedClientsComponent,
                canActivate: [AuthActivate],
                data: {
                  autenticationRequired: true,
                  autenticationFailureRedirectUrl: '/control-panel/login',
                }
              },
              {path: 'account-settings', component: AccountSettingsComponent,
                canActivate: [AuthActivate],
                data: {
                  autenticationRequired: true,
                  autenticationFailureRedirectUrl: '/control-panel/login',
                }
              },
              {path: 'allowed-domains', component: AllowedDomainsComponent,
                canActivate: [AuthActivate],
                data: {
                  autenticationRequired: true,
                  autenticationFailureRedirectUrl: '/control-panel/login',
                }
              }
            ]
          },
          {path: '**', redirectTo: 'settings'}
        ]
      }
    ])
  ],
  exports: [
    ControlPanelComponent
  ]
})
export class ControlPanelModule { }
