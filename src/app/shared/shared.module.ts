import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { FilterPipe } from './pipes/find-uniques.pipe';
import { SearchPipePipe } from './pipes/search-pipe.pipe';

@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    SearchPipePipe,
    FilterPipe
  ],
  imports: [
    CommonModule, 
    RouterModule
  ],
  exports: [
    LoadingSpinnerComponent,
    SearchPipePipe,
    FilterPipe
  ]
})
export class SharedModule {}
