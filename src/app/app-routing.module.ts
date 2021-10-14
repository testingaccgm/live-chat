import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: 'chat', loadChildren: () => import ('./chat/chat.module').then(m => m.ChatModule)},
  {path: 'control-panel', loadChildren: () => import ('./control-panel/control-panel.module').then(m => m.ControlPanelModule)},
  {path: 'error', loadChildren: () => import ('./error/error.module').then(m => m.ErrorModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
