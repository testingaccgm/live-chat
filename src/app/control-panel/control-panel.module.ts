import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlPanelComponent } from './control-panel.component';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatsComponent } from './chats/chats.component';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { RegisterComponent } from './settings/register/register.component';
import { AuthActivate } from '../shared/services/auth.activate';
import { HeaderComponent } from './header/header.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    ControlPanelComponent,
    LoginComponent,
    ChatsComponent,
    RegisterComponent,
    HeaderComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild([
      {path: '', component: ControlPanelComponent,
        children: [
          {path: 'login', component: LoginComponent,
            canActivate: [AuthActivate],
            data: {
              autenticationRequired: false,
              autenticationFailureRedirectUrl: '/control-panel/login',
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
              {path: 'register', component: RegisterComponent,
                canActivate: [AuthActivate],
                data: {
                  autenticationRequired: true,
                  autenticationFailureRedirectUrl: '/control-panel/login',
                }
              }
            ]
          },
        ]
      }
    ])
  ],
  exports: [
    ControlPanelComponent
  ]
})
export class ControlPanelModule { }
