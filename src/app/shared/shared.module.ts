import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { FilterRolePipe } from './pipes/filter-roles.pipe';
import { SearchPipePipe } from './pipes/search-pipe.pipe';

@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    SearchPipePipe,
    FilterRolePipe
  ],
  imports: [
    CommonModule, 
    RouterModule
  ],
  exports: [
    LoadingSpinnerComponent,
    SearchPipePipe,
    FilterRolePipe
  ]
})
export class SharedModule {}
