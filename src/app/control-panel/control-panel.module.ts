import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlPanelComponent } from './control-panel.component';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatsComponent } from './chats/chats.component';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    ControlPanelComponent,
    LoginComponent,
    ChatsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild([
      {path: '', component: ControlPanelComponent,
        children: [
          {path: 'login', component: LoginComponent},
          {path: 'chats', component: ChatsComponent}
        ]
      }
    ])
  ],
  exports: [
    ControlPanelComponent
  ]
})
export class ControlPanelModule { }
