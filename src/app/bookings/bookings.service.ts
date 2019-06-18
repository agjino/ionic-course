import { Injectable } from '@angular/core';
import {Booking} from './booking.model';
import {BehaviorSubject, Subject} from 'rxjs';
import {AuthService} from '../auth/auth.service';
import {delay, map, switchMap, take, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';
import {Place} from '../places/place.model';

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
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService,
              private http: HttpClient) { }

  get bookings() {
    return this._bookings.asObservable();
  }

  fetchPlaces() {
    const userId = this.authService.userId;
    return this.http.get<{[key: string]: FirebaseBooking}>(`https://ionic-course-afe24.firebaseio.com/bookings.json` +
        `?orderBy="userId"&equalTo="${userId}"`)
      .pipe(map(resData => {
        const bookings = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            const bookingData = resData[key];
            bookings.push(new Booking(key, bookingData.placeId, bookingData.userId, bookingData.placeTitle, bookingData.placeImage,
              bookingData.firstName, bookingData.lastName, bookingData.guestNumber, new Date(bookingData.bookedFrom),
              new Date(bookingData.bookedTo)));
          }
        }
        return bookings;
      }), tap(places => {
        this._bookings.next(places);
      }));
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
    return this.http.delete(`https://ionic-course-afe24.firebaseio.com/bookings/${id}.json`)
      .pipe(switchMap( () => {
        return this.bookings;
      }),
      take(1),
      tap( bookings => {
        this._bookings.next(bookings.filter( booking => booking.id !== id));
      }));
  }
}
