import { Component, OnInit } from '@angular/core';

import { AuthService } from './shared/services/auth.service';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private _authservice: AuthService,
    private _themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // this._authservice.logout();

    this._authservice.autoLogin();
    this._themeService.getCurrentTheme();

    console.log(window.document.referrer);
  }
}
