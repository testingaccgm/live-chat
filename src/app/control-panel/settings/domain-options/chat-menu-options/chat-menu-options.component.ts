import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

import { MenuOption } from 'src/app/shared/models/menu-option.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-menu-options',
  templateUrl: './chat-menu-options.component.html',
  styleUrls: ['./chat-menu-options.component.scss']
})
export class ChatMenuOptionsComponent implements OnInit, OnDestroy {
  menuOptionsForm!: FormGroup;

  menuOptions!: MenuOption[];
  private _menuOptionsSubscription!: Subscription;
  currentOption!: MenuOption;

  ismenuOptionsFormActive: boolean = false;
  isInEditMenuEditOptionMode: boolean = false;
  
  menuEditedImage!: string;

  isLoading: boolean = false;
  
  isDeleteMenuOptionPopUpActive: boolean = false;

  erroOnGetMenuOptions: string = '';
  errorOnAddMenuOption: string = '';
  errorOnDeleteMenuOption: string = '';
  errorOnAddMenuOptionItem: string = '';
  erroOnEditMenuOption: string = '';

  constructor(
    private _fb: FormBuilder,
    private _firestoreCollectionService: FirestoreCollectionsService
  ) { }

  ngOnInit(): void {
    this.menuOptionsForm = this._fb.group({
      key: [null, [Validators.required]],
      description: [null, Validators.required],
      active: [true]
    });

    this._menuOptionsSubscription = this._firestoreCollectionService.getMenuOptions()
    .subscribe(menuOptions => {
      this.menuOptions = menuOptions.map(e => {
        return {
          id: e.payload.doc.id,
          ... e.payload.doc.data() as MenuOption
        }
      });
      this.erroOnGetMenuOptions = '';
    }, error => {
      this.erroOnGetMenuOptions = error.message;
    })
  };

  ngOnDestroy(): void {
    this._menuOptionsSubscription.unsubscribe();
  };

  activateMenuOptionForm() {
    this.ismenuOptionsFormActive = true;
  };

  clearMenuOptionForm() {
    this.ismenuOptionsFormActive = false;    
    this.currentOption = undefined!;
    this.isDeleteMenuOptionPopUpActive = false;
    this.isInEditMenuEditOptionMode = false;
    this.menuEditedImage = undefined!;
    this.menuOptionsForm.reset();
  };

  submitMenuOptionsForm(menuOptionsForm: FormGroup) {
    if (menuOptionsForm.invalid) {
      return;
    };

    this.isLoading = true;

    const key = menuOptionsForm.value.key;
    const description = menuOptionsForm.value.description;
    const active = menuOptionsForm.value.active;
    const menuItemObj = { key, description, active };      

    return this._firestoreCollectionService.addMenuOptionItem(menuItemObj).then(() => {
      this.clearMenuOptionForm();
      this.ismenuOptionsFormActive = false;
      this.errorOnAddMenuOption = '';
      this.isLoading = false;
    }, error => {
      this.errorOnAddMenuOption = error.message;
      this.isLoading = false;
    });
  };

  deleteMenuOptionPopUp(menuOption: MenuOption) {
    this.currentOption = menuOption;
    this.isDeleteMenuOptionPopUpActive = true;
  };

  deleteMenuOption() {
    this._firestoreCollectionService.deleteMenuOptionItem(this.currentOption).then(() => {
      this.clearMenuOptionForm();
      this.errorOnDeleteMenuOption = '';
    }, error => {
      this.errorOnDeleteMenuOption = error.message;
    });
  };

  editOption(menuOptionItem: MenuOption) {
    this.ismenuOptionsFormActive = true;
    this.isInEditMenuEditOptionMode = true;
    this.currentOption = menuOptionItem;

    this.menuOptionsForm.controls['key'].setValue(menuOptionItem.key);
    this.menuOptionsForm.controls['description'].setValue(menuOptionItem.description);
    this.menuOptionsForm.controls['active'].setValue(menuOptionItem.active);
  };

  submitmenuEditOptionsForm() {
    const key = this.menuOptionsForm.value.key;
    const description = this.menuOptionsForm.value.description;
    const active = this.menuOptionsForm.value.active;
    const id = this.currentOption.id;

    const formObj = {key, description, active, id};

    this._firestoreCollectionService.editMenuOptionItem(formObj).then(() => {
      this.clearMenuOptionForm();
      this.errorOnAddMenuOptionItem = '';
    }, error => {
      this.errorOnAddMenuOptionItem = error.message;
    })
  };
}
