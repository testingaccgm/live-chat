import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { User } from 'src/app/shared/models/user.model';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

@Component({
  selector: 'app-active-acounts',
  templateUrl: './active-acounts.component.html',
  styleUrls: ['./active-acounts.component.scss']
})
export class ActiveAcountsComponent implements OnInit, OnDestroy {
  activeUsers!: User[];
  activeUsersSubscription!: Subscription;

  constructor(
    private _firestoreCollections: FirestoreCollectionsService
  ) { }

  ngOnInit(): void {
    // this._authService.enableLoadingSpinner();
    this.activeUsersSubscription = this._firestoreCollections.getUserData('active', true).subscribe(users => {
      this.activeUsers = users.map(e => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data() as User
        };
      })

      // this._authService.disableLoadingSpinner();
      // no error
      // this.errorMsgOnGetUsers = '';
    }, error => {
      // this._authService.disableLoadingSpinner();
      // error
      // this.errorMsgOnGetUsers = error.message;
    });
  };

  ngOnDestroy(): void {
    this.activeUsersSubscription.unsubscribe();
  }
}
