import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { SearchPipePipe } from './pipes/search-pipe.pipe';
import { ChatFormComponent } from './chat-form/chat-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ChatFormHistoryComponent } from './chat-form-history/chat-form-history.component';

@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    SearchPipePipe,
    ChatFormComponent,
    ChatFormHistoryComponent
  ],
  imports: [
    CommonModule, 
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    LoadingSpinnerComponent,
    SearchPipePipe,
    ChatFormComponent,
    ChatFormHistoryComponent
  ]
})
export class SharedModule {}
