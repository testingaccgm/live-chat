import { Component, OnInit } from '@angular/core';

import { User } from 'src/app/shared/models/user.model';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];

  constructor(
    private _firestoreCollections: FirestoreCollectionsService
  ) { }

  ngOnInit(): void {

  }

}
