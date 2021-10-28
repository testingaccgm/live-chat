import { Component, OnDestroy, OnInit } from '@angular/core';
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

  isOptionMenuActive: boolean = false;

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

  deactivateMenuOptionForm() {
    this.isOptionMenuActive = false;
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
        menuOptionsForm.reset();
        this.menuFileLocalPath = this.menuDefaultImg;

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
    }   
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
}
