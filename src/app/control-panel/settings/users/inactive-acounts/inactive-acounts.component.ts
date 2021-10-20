import { Component, OnInit } from '@angular/core';

import { User } from 'src/app/shared/models/user.model';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

@Component({
  selector: 'app-inactive-acounts',
  templateUrl: './inactive-acounts.component.html',
  styleUrls: ['./inactive-acounts.component.scss']
})
export class InactiveAcountsComponent implements OnInit {
  inactiveUsers!: User[];
  constructor(
    private _firestoreCollections: FirestoreCollectionsService
  ) { }

  ngOnInit(): void {
    // this._authService.enableLoadingSpinner();
    this._firestoreCollections.getUserData('active', false).subscribe(users => {            
      this.inactiveUsers = users.map(e => {
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
}
