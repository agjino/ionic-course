import { Injectable } from '@angular/core';
import {Place} from './place.model';
import {AuthService} from '../auth/auth.service';
import {BehaviorSubject, Observable, of, timer} from 'rxjs';
import {delay, map, switchMap, take, tap} from 'rxjs/operators';
import {HttpClient} from '@angular/common/http';


/* new Place('p1', 'Manhattan', 'Heart of the City', 'https://static01.nyt.com/images/2017/08/13/realestate/' +
  '13LIVING-slide-RXIK/13LIVING-slide-RXIK-articleLarge.jpg?quality=75&auto=webp&disable=upscale', 149.99,
  new Date('2019-01-01'), new Date('2019-12-31'), 'abc'),
  new Place('p2', 'L\'Amout Toujours', 'Romantic Place in Paris',
    'https://concoursmondial.com/wp-content/uploads/paris.jpg', 189.99,
    new Date('2019-01-01'), new Date('2019-12-31'), 'abc'),
  new Place('p3', 'Foggy Palace', 'Not your average trip',
    'https://victortravelblogdotcom.files.wordpress.com/2015/01/pena-palace-in-fog-sintra-portugal-42.jpg?w=780', 99.99,
    new Date('2019-01-01'), new Date('2019-12-31'), 'abc')
 */

interface FirebasePlace {
  availableFrom: string;
  availableTo: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  get places(): Observable<Place[]> {
    return this._places.asObservable();
  }
  // tslint:disable-next-line:variable-name
  private _places = new BehaviorSubject<Place[]>([]);

  constructor(private authService: AuthService,
              private http: HttpClient) { }

  getPlace(placeId: string) {
    return this.http.get<FirebasePlace>
      (`https://ionic-course-afe24.firebaseio.com/offered-places/${placeId}.json`)
      .pipe(map((resData: FirebasePlace) => {
        return new Place(placeId, resData.title, resData.description, resData.imageUrl, resData.price,
          new Date(resData.availableFrom), new Date(resData.availableTo), resData.userId);
      }));

    /*return this.places.pipe(take(1), map( places => {
        return { ...places.find( place => place.id === placeId) };
    }));*/
  }

  fetchPlaces() {
    return this.http.get<{[key: string]: FirebasePlace}>('https://ionic-course-afe24.firebaseio.com/offered-places.json')
      .pipe(map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            const placeData = resData[key];
            places.push(new Place(key, placeData.title, placeData.description, placeData.imageUrl, placeData.price,
              new Date(placeData.availableFrom), new Date(placeData.availableTo), placeData.userId));
          }
        }
        return places;
      }), tap(places => {
          this._places.next(places);
      }));
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    let generatedId = null;
    const newPlace = new Place(Math.random().toString(),
      title, description, 'https://victortravelblogdotcom.files.wordpress.com/2015/01/pena-palace-in-fog-sintra-portugal-42.jpg?w=780',
      price, dateFrom, dateTo, this.authService.userId);

    return this.http.post<{name: string}>('https://ionic-course-afe24.firebaseio.com/offered-places.json', { ...newPlace, id: null })
      .pipe(switchMap(resData => {
        generatedId = resData.name;
        return this.places;
      }),
      take(1),
      tap(places => {
        newPlace.id = generatedId;
        this._places.next(places.concat(newPlace));
      }));


    /*return this.places.pipe(take(1), delay(1000),
      tap( places => {
        this._places.next(places.concat(newPlace));
      }));*/
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap( places => {
        if (!places || places.length === 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap( places => {
        const updatedPlaceIndex = places.findIndex( el => el.id === placeId );
        updatedPlaces = [...places];
        const oldPlace = places[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(oldPlace.id, title, description, oldPlace.imageUrl, oldPlace.price,
          oldPlace.availableFrom, oldPlace.availableTo, oldPlace.userId);
        return this.http.put(`https://ionic-course-afe24.firebaseio.com/offered-places/${placeId}.json`,
          { ...updatedPlaces[updatedPlaceIndex], id: null });
        }),
      tap( response => {
        this._places.next(updatedPlaces);
      }));
  }
}
