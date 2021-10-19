import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { SearchPipePipe } from './pipes/search-pipe.pipe';

@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    SearchPipePipe
  ],
  imports: [
    CommonModule, 
    RouterModule
  ],
  exports: [
    LoadingSpinnerComponent,
    SearchPipePipe
  ]
})
export class SharedModule {}
