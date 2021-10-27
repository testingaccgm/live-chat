import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Domain } from 'src/app/shared/models/domains.model';
import { User } from 'src/app/shared/models/user.model';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

@Component({
  selector: 'app-allowed-domains',
  templateUrl: './allowed-domains.component.html',
  styleUrls: ['./allowed-domains.component.scss']
})
export class AllowedDomainsComponent implements OnInit, OnDestroy {
  addDomainForm!: FormGroup;

  domains!: Domain[];
  private _domainsSubscription!: Subscription;
  errorOnGetDomains!: string;
  private _errorOnGetDomainsSubscription!: Subscription;

  users!: User[];
  private _usersSubscription!: Subscription;

  deleteDomainPopUp: boolean = false;
  currentDomain!: Domain;

  constructor(
    private _fb: FormBuilder,
    private _firestoreCollections: FirestoreCollectionsService
  ) { }

  ngOnInit(): void {
    this.addDomainForm = this._fb.group({
      domain: [null, Validators.required],
      key: [null, Validators.required],
      description: [null, Validators.required]
    });

    this._firestoreCollections.getDomains();
    this._domainsSubscription = this._firestoreCollections.domainsSubject.subscribe(domains => {
      this.domains = domains;
    });

    this._errorOnGetDomainsSubscription = this._firestoreCollections.errorOnGetDomainsSubject.subscribe(error => {
      this.errorOnGetDomains = error;
    });

    this._usersSubscription = this._firestoreCollections.getUsers().subscribe(users => {
      this.users = users.map(e => {
        return {
          id: e.payload.doc.id,
          ... e.payload.doc.data() as User
        }
      });

      // no error
    }, error => {
      // error
    });
  }

  ngOnDestroy(): void {
   this._domainsSubscription.unsubscribe();
   this._errorOnGetDomainsSubscription.unsubscribe();
   this._firestoreCollections.domainsUnsubscribe();
   this._usersSubscription.unsubscribe();
  }

  submitDomainForm(addDomainForm: FormGroup) {
    if (addDomainForm.invalid) {
      return;
    }

    const domain = addDomainForm.value.domain
    const key = addDomainForm.value.key
    const description = addDomainForm.value.description
    const checked = false;
    const domainObj = { domain, key, description, checked }

    this._firestoreCollections.addDomain(domainObj).then(() => {
      for (const user of this.users) {
        this._firestoreCollections.setDomain(user.uid!, domainObj).then(() => {
          
        }, error => {

        });
      };
      addDomainForm.reset();
      // no error
    }, error => {
      // error
    })
  };

  deleteDomain() {
    this._firestoreCollections.deleteDomain(this.currentDomain.id!).then(() => {
    const description = this.currentDomain.description;
    const domain = this.currentDomain.domain;
    const key = this.currentDomain.key;    

      for (const user of this.users) {
        const domainObj = {checked: true, description, domain, key};
        this.deleteDomainItem(user.uid!, domainObj);
      };

      for (const user of this.users) {
        const domainObj = {checked: false, description, domain, key};
        this.deleteDomainItem(user.uid!, domainObj);
      };

      this.cancelPopUpFun();
      // no error
    }, error => {
      // error
    })
  };

  deleteDomainPopUpFun(domain: Domain) {
    this.deleteDomainPopUp = true;
    this.currentDomain = domain;
  };

  cancelPopUpFun() {
    this.deleteDomainPopUp = false;
    this.currentDomain = undefined!;
  };

  deleteDomainItem(userId: string, domainObj: any) {
    this._firestoreCollections.deleteDomainItem(userId, domainObj).then(() => {
      // no error          
    }, error => {
      // error
    });
  };
}
