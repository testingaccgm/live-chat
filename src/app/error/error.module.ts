import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from './error.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ErrorComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: '', component: ErrorComponent}
    ])
  ],
  exports: [
    ErrorComponent
  ]
})
export class ErrorModule { }
