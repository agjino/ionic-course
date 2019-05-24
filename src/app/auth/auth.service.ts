import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  get userIsAuthenticated(): boolean {
    return this._userIsAuthenticated;
  }
  get userId(): string {
    return this._userId;
  }
  // tslint:disable-next-line:variable-name
  private _userIsAuthenticated = true;
  // tslint:disable-next-line:variable-name
  private _userId: string = 'abc2';

  constructor() { }

  login() {
    this._userIsAuthenticated = true;
  }

  logout() {
    this._userIsAuthenticated = false;
  }
}
