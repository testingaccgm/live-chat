import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Chat } from 'src/app/shared/models/chat.model';
import { User } from 'src/app/shared/models/user.model';
import { AuthService } from 'src/app/shared/services/auth.service';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

export interface IChats {
  domainDescription: string,
  fsCollection: any,
  chatsSubscription: any,
  chats?: any
};

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit, OnDestroy {
  user!: User;
  private _userSubscription!: Subscription;

  activeChats: IChats[] = [];

  constructor(
    private _authService: AuthService,
    private _firestoreCollections: FirestoreCollectionsService
  ) { }

  ngOnInit(): void {
    this._userSubscription = this._authService.user.subscribe(user => {
      this.user = user;
      if (this.user != undefined) {
        for (const domainRole of this.user.domains!) {
          if(domainRole.checked) {
            const domainDescription = domainRole.description;
            const fsCollection = domainRole.domain;
            const chatsSubscription = '';

            const domainRoleObj = { domainDescription, fsCollection, chatsSubscription }
            this.activeChats.push(domainRoleObj)
          }
        }

        for (let i = 0; i < this.activeChats.length; i++) {
          const domain = this.activeChats[i].fsCollection;
          const status = 'activeChats';

          this.activeChats[i].chatsSubscription = this._firestoreCollections.getChats(domain, status)
          .subscribe(data => {
            this.activeChats[i].chats = data.map(e => {
              return {
                ... e.payload.doc.data()
              }
            })
          })
        };
      }
    });
  };

  ngOnDestroy(): void {
   this._userSubscription.unsubscribe();
   
   for (const domainEl of this.activeChats) {
     domainEl.chatsSubscription.unsubscribe();
   };
  };

  acceptChat(chat: Chat) {
    const operatorDisplayName = this.user.name;
    const operatorEmail = this.user.email;
    const operator = { operatorDisplayName, operatorEmail }
    this._firestoreCollections.acceptPendingChat(chat, operator).then(() => {

    }, error => {

    });
  };
}
