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

  users!: User[];
  private _usersSubscription!: Subscription;

  deleteDomainPopUp: boolean = false;
  currentDomain!: Domain;

  showDomainForm: boolean = false;

  errorOnGetUsers: string = '';
  errorOnGetDomains: string = '';
  errorOnAddDomain: string = '';
  errorOnSetDomain: string = '';
  errorOnDeleteDomain: string = '';
  errorOnDeleteDomainItem: string = '';

  constructor(
    private _fb: FormBuilder,
    private _firestoreCollections: FirestoreCollectionsService
  ) { }

  ngOnInit(): void {
    this.addDomainForm = this._fb.group({
      domain: [null, [Validators.required, Validators.pattern('^[a-z]*$')]],
      description: [null, Validators.required]
    });

    this._usersSubscription = this._firestoreCollections.getUsers().subscribe(users => {
      this.users = users.map(e => {
        return {
          id: e.payload.doc.id,
          ... e.payload.doc.data() as User
        }
      });
      this.errorOnGetUsers = '';
    }, error => {
      this.errorOnGetUsers = error.message;
    });

    this._domainsSubscription = this._firestoreCollections.getDomains().subscribe(domains => {
      this.domains = domains.map(e => {
        return {
          id: e.payload.doc.id,
          ... e.payload.doc.data() as Domain
        }
      });
      this.errorOnGetDomains = '';
    }, error => {
      this.errorOnGetDomains = error.message;
    });
  };

  ngOnDestroy(): void {
   this._domainsSubscription.unsubscribe();
   this._usersSubscription.unsubscribe();
  };

  onShowDomainForm() {
    this.showDomainForm = true;
  };

  onResetDomainForm() {
    this.showDomainForm = false;
    this.addDomainForm.reset();
  };

  submitDomainForm(addDomainForm: FormGroup) {
    if (addDomainForm.invalid) {
      return;
    }

    const domain = addDomainForm.value.domain
    const description = addDomainForm.value.description
    const checked = false;
    const domainObj = { domain, description }
    const userDomainObj = { domain, description, checked }

    this._firestoreCollections.addDomain(domainObj).then(() => {
      for (const user of this.users) {        
        this._firestoreCollections.setDomain(user.uid!, userDomainObj).then(() => {
          this.onResetDomainForm();
          this.errorOnSetDomain = '';
        }, error => {
          this.errorOnSetDomain = error.message;
        });
      };
      addDomainForm.reset();
      this.errorOnAddDomain = '';
    }, error => {
      this.errorOnAddDomain = error.message;
    })
  };

  deleteDomain() {
    this._firestoreCollections.deleteDomain(this.currentDomain.id!).then(() => {
    const description = this.currentDomain.description;
    const domain = this.currentDomain.domain;   

      for (const user of this.users) {
        const domainObj = {checked: true, description, domain};
        this.deleteDomainItem(user.uid!, domainObj);
      };

      for (const user of this.users) {
        const domainObj = {checked: false, description, domain};
        this.deleteDomainItem(user.uid!, domainObj);
      };

      this.cancelPopUpFun();
      this.errorOnDeleteDomain = '';
    }, error => {
      this.errorOnDeleteDomain = error.message;
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
      this.errorOnDeleteDomainItem = '';          
    }, error => {
      this.errorOnDeleteDomainItem = error.message;
    });
  };
}
