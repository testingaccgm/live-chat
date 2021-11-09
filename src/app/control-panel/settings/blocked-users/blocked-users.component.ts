import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { BlockedUser } from 'src/app/shared/models/blocked-user.model';
import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

@Component({
  selector: 'app-blocked-users',
  templateUrl: './blocked-users.component.html',
  styleUrls: ['./blocked-users.component.scss']
})
export class BlockedUsersComponent implements OnInit, OnDestroy {
  blockedUsers: BlockedUser[] = [];
  private _blockedUsersSubscription!: Subscription;

  isInBlockMode: boolean = false;

  addUserForBlockForm!: FormGroup;

  user!: User;
  private _userSubscription!: Subscription;;

  constructor(
    private _fireStoreCollections: FirestoreCollectionsService,
    private _fb: FormBuilder,
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    this._blockedUsersSubscription = this._fireStoreCollections.getBlockedUsersById().subscribe(blockedUsers => {
      this.blockedUsers = blockedUsers.map(e => {
        return {
          id: e.payload.doc.id,
          ... e.payload.doc.data() as BlockedUser
        }
      });
    }, error => {

    });

    this._userSubscription = this._authService.user.subscribe(user => {
     this.user = user;
    });

    this.addUserForBlockForm = this._fb.group({
      username: [null, Validators.required],
      ip: [null, Validators.required],
      reason: [null, Validators.required],
      operator: []
    });
  };

  ngOnDestroy(): void {
    this._blockedUsersSubscription.unsubscribe();
    this._userSubscription.unsubscribe();
  };

  unblockUser(blockedUserId: string) {
    this._fireStoreCollections.deleteBlockedUser(blockedUserId).then(() => {

    }, error => {

    });
  };

  enableAddBlockMode() {
   this.isInBlockMode = true;
  };

  resetAddUserForBlockForm() {
   this.isInBlockMode = false;
   this.addUserForBlockForm.reset();
  };

  submitAddUserForBlockForm(addUserForBlockForm: FormGroup) {
    if (addUserForBlockForm.invalid) {
      return;
    };
    const username = addUserForBlockForm.value.username;
    const ip = addUserForBlockForm.value.ip;
    const reason = addUserForBlockForm.value.reason;
    const operator = this.user.email;
    const blockedUserObj = { username, ip, reason, operator }

   this._fireStoreCollections.blockUserByIp(blockedUserObj).then(() => {
    this.resetAddUserForBlockForm();
   }, error => {

   });
  };
}
