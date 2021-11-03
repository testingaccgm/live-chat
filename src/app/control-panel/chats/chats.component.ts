import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Chat } from 'src/app/shared/models/chat.model';
import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit, OnDestroy {
  user!: User;
  private _userSubscription!: Subscription;

  pendingChats!: Chat[];
  private _pendingChatsSubscription!: Subscription;

  constructor(
    private _authService: AuthService,
    private _firestoreCollections: FirestoreCollectionsService
  ) { }

  ngOnInit(): void {
    this._userSubscription = this._authService.user.subscribe(user => {
      this.user = user;
    });

    this._pendingChatsSubscription = this._firestoreCollections.getPendingChats().subscribe(chats => {
      this.pendingChats = chats.map(e => {
        return {
          ... e.payload.doc.data() as Chat
        }
      })

      console.log(this.pendingChats);
      
    }, error => {

    });
  };

  ngOnDestroy(): void {
   this._userSubscription.unsubscribe();
   this._pendingChatsSubscription.unsubscribe();
  };
}
