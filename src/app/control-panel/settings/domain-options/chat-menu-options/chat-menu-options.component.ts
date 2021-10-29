import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { FirestoreCollectionsService } from 'src/app/shared/services/firestore-collections.service';

import { GenerateIdService } from 'src/app/shared/services/generate-id.service';
import { MenuOption } from 'src/app/shared/models/menu-option.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-menu-options',
  templateUrl: './chat-menu-options.component.html',
  styleUrls: ['./chat-menu-options.component.scss']
})
export class ChatMenuOptionsComponent implements OnInit, OnDestroy {
  menuOptionsForm!: FormGroup;
  menuFile!: any;
  menuDefaultImg: string = '../../../../../assets/images/menu-options/upload-img.png';
  menuFileLocalPath: string = this.menuDefaultImg;

  menuOptions!: MenuOption[];
  private _menuOptionsSubscription!: Subscription;
  currentOption!: MenuOption;

  isOptionMenuActive: boolean = false;
  isInEditMenuEditOptionMode: boolean = false;
  
  menuEditedImage!: string;
  
  isDeleteMenuOptionPopUpActive: boolean = false;

  constructor(
    private _fb: FormBuilder,
    private _angularFireStorage: AngularFireStorage,
    private _firestoreCollectionService: FirestoreCollectionsService,
    private _generateIdService: GenerateIdService
  ) { }

  ngOnInit(): void {
    this.menuOptionsForm = this._fb.group({
      key: [null, Validators.required],
      description: [null, Validators.required],
      active: [true],
      img: [null, Validators.required]
    });

    this._menuOptionsSubscription = this._firestoreCollectionService.getMenuOptions()
    .subscribe(menuOptions => {
      this.menuOptions = menuOptions.map(e => {
        return {
          id: e.payload.doc.id,
          ... e.payload.doc.data() as MenuOption
        }
      })
    }, error => {

    })
  };

  ngOnDestroy(): void {
    this._menuOptionsSubscription.unsubscribe();
  };

  activateMenuOptionForm() {
    this.isOptionMenuActive = true;
  };

  clearMenuOptionForm() {
    this.isOptionMenuActive = false;    
    this.currentOption = undefined!;
    this.isDeleteMenuOptionPopUpActive = false;
    this.isInEditMenuEditOptionMode = false;
    this.menuEditedImage = undefined!;
    this.menuFileLocalPath = this.menuDefaultImg;
    this.menuOptionsForm.reset();
  };

  submitMenuOptionsForm(menuOptionsForm: FormGroup) {
    if (menuOptionsForm.invalid) {
      return;
    };    

    this.uploadCarImgToFirestore().then(() => {
      const key = menuOptionsForm.value.key;
      const description = menuOptionsForm.value.description;
      const img = menuOptionsForm.value.img;
      const active = menuOptionsForm.value.active;
      const menuItemObj = { key, description, img, active };

      return this._firestoreCollectionService.addMenuOptionItem(menuItemObj).then(() => {
        this.clearMenuOptionForm();
        this.menuFileLocalPath = this.menuDefaultImg;
        this.isOptionMenuActive = false;

      }, error => {

      });

      // no error
    }, error => {
      // error
    });
  };

  selectMenuImg(event: any) {
    this.menuFile = event.target.files[0];
    if (this.menuFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.menuFileLocalPath = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
    } else {
      this.menuFileLocalPath = this.menuDefaultImg;
    };    
  };

  uploadCarImgToFirestore() {
    return new Promise<void>((resolve, reject) => {
      this._angularFireStorage.upload(
        "/optionMenuImages/" +
        this._generateIdService.generateId() +
        this.menuFile.name, this.menuFile)
      .then((uploadTask) => {
        uploadTask.ref.getDownloadURL()
        .then(url => {          
          this.menuOptionsForm.value.img = url;
          // no error         
          resolve();
        }, (error) => {
          // error
        });
        // no error 
      }, (error) => {
        // error
      })
    })
  };

  deleteMenuOptionPopUp(menuOption: MenuOption) {
    this.currentOption = menuOption;
    this.isDeleteMenuOptionPopUpActive = true;
  };

  deleteMenuOption() {
    this._firestoreCollectionService.deleteItemFromFireStorage(this.currentOption.img!).then(() => {
      this._firestoreCollectionService.deleteMenuOptionItem(this.currentOption).then(() => {
        this.clearMenuOptionForm();
      }, error => {
  
      })
    }, error => {

    });
  };

  editOption(menuOptionItem: MenuOption) {
    this.isOptionMenuActive = true;
    this.isInEditMenuEditOptionMode = true;
    this.currentOption = menuOptionItem;

    this.menuOptionsForm = this._fb.group({
      key: [menuOptionItem.key, Validators.required],
      description: [menuOptionItem.description, Validators.required],
      active: [menuOptionItem.active],
      img: [null]
    });
  };

  submitmenuEditOptionsForm() {
    const key = this.menuOptionsForm.value.key;
    const description = this.menuOptionsForm.value.description;
    const active = this.menuOptionsForm.value.active;
    const id = this.currentOption.id;

    const formObj = {key, description, active, id};

    this._firestoreCollectionService.editMenuOptionItem(formObj).then(() => {
      this.clearMenuOptionForm();
    }, error => {

    })
  };

  editMenuImg(event: any, menuOption: MenuOption) {
    this.currentOption = menuOption;
    this.menuFile = event.target.files[0];
    if (this.menuFile) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.menuEditedImage = event.target.result;
      }
      reader.readAsDataURL(event.target.files[0]);
    } else {
      this.menuEditedImage = undefined!;
      this.currentOption = undefined!;
    };
  };

  applyNewImg() {
    this._firestoreCollectionService.deleteItemFromFireStorage(this.currentOption.img!).then(() => {
      this.uploadCarImgToFirestore().then(() => {
        console.log(this.menuEditedImage);
        this._firestoreCollectionService.editMenuOptioImage(this.currentOption.id!, this.menuOptionsForm.value.img).then(() => {
          this.clearMenuOptionForm();
        }, error => {
  
        })   
      });
    }, error => {

    })
  };
}
