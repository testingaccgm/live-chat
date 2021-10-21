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
import { ActiveAcountsComponent } from './settings/users/active-acounts/active-acounts.component';
import { InactiveAcountsComponent } from './settings/users/inactive-acounts/inactive-acounts.component';
import { UsersTemplateComponent } from './settings/users/users-template/users-template.component';
import { RoleActive } from '../shared/services/role.activate';

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
    AllowedDomainsComponent,
    ActiveAcountsComponent,
    InactiveAcountsComponent,
    UsersTemplateComponent    
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
              autenticationFailureRedirectUrl: '/control-panel/chats',
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
                children: [
                  {path: 'active', component: ActiveAcountsComponent},
                  {path: 'inactive', component: InactiveAcountsComponent},
                  {path: '', redirectTo: 'active', pathMatch: 'full'}
                ],
                canActivate: [RoleActive],
                data: {
                  role: 'users',
                  autenticationFailureRedirectUrl: '/control-panel/settings'
                }
              },
              {path: 'register', component: RegisterComponent,
                canActivate: [RoleActive],
                data: {
                  role: 'register',
                  autenticationFailureRedirectUrl: '/control-panel/settings'
                }
              },
              {path: 'blocked-clients', component: BlockedClientsComponent,
                canActivate: [RoleActive],
                data: {
                  role: 'blockedClients',
                  autenticationFailureRedirectUrl: '/control-panel/settings'
                }
              },
              {path: 'account-settings', component: AccountSettingsComponent,
                canActivate: [RoleActive],
                data: {
                  role: 'accountSettings',
                  autenticationFailureRedirectUrl: '/control-panel/settings'
                }
              },
              {path: 'allowed-domains', component: AllowedDomainsComponent,
                canActivate: [RoleActive],
                data: {
                  role: 'allowedDomains',
                  autenticationFailureRedirectUrl: '/control-panel/settings'
                }
              }
            ],
            canActivate: [AuthActivate],
            data: {
              autenticationRequired: true,
              autenticationFailureRedirectUrl: '/control-panel/login',
            }
          },
          {path: '**', redirectTo: 'chats'}
        ]
      }
    ])
  ],
  exports: [
    ControlPanelComponent
  ]
})
export class ControlPanelModule { }
