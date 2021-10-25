import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Domain } from 'src/app/shared/models/domains.model';
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
  }

  ngOnDestroy(): void {
   this._domainsSubscription.unsubscribe();
   this._errorOnGetDomainsSubscription.unsubscribe();
   this._firestoreCollections.domainsUnsubscribe();
  }

  submitDomainForm(addDomainForm: FormGroup) {
    if (addDomainForm.invalid) {
      return;
    }

    const domain = addDomainForm.value.domain
    const key = addDomainForm.value.key
    const description = addDomainForm.value.description
    const domainObj = { domain, key, description }

    this._firestoreCollections.addDomain(domainObj).then(() => {
      
      // no error
    }, error => {
      // error
    })
  }
}
