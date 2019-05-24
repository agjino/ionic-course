import { Injectable } from '@angular/core';
import {Booking} from './booking.model';
import {BehaviorSubject} from 'rxjs';
import {AuthService} from '../auth/auth.service';
import {delay, switchMap, take, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';

interface FirebaseBooking {
  firstName: string;
  lastName: string;
  placeId: string;
  placeTitle: string;
  placeImage: string;
  userId: string;
  guestNumber: number;
  bookedFrom: string;
  bookedTo: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private _bookings = new BehaviorSubject<Booking[]>([{
    id: 'a',
    firstName: 'aa',
    lastName: 'aaa',
    placeId: '1',
    placeTitle: 'A',
    placeImage: 'B',
    userId: 'd',
    guestNumber: 3,
    bookedFrom: new Date(),
    bookedTo: new Date()
  }]);

  constructor(private authService: AuthService,
              private http: HttpClient) { }

  get bookings() {
    return this._bookings.asObservable();
  }

  addBooking(placeId: string, placeTitle: string, placeImage: string, firstName: string, lastName: string, guestNo: number,
             dateFrom: Date, dateTo: Date) {
    let generatedId: string;
    const newBooking = new Booking(Math.random().toString(), placeId, this.authService.userId, placeTitle, placeImage, firstName, lastName,
      guestNo, dateFrom, dateTo);

    return this.http.post<{name: string}>('https://ionic-course-afe24.firebaseio.com/bookings.json',
      {...newBooking, id: null})
      .pipe(switchMap( resData => {
        generatedId = resData.name;
        return this.bookings;
      }), take(1),
      tap( bookings => {
        newBooking.id = generatedId;
        this._bookings.next(bookings.concat(newBooking));
      }));
  }

  cancelBooking(id: string) {
    return this.bookings.pipe(take(1), delay(1000), tap( bookings => {
      this._bookings.next(bookings.filter( booking => booking.id !== id));
    }));
  }
}
