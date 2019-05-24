import {Component, OnDestroy, OnInit} from '@angular/core';
import {BookingsService} from './bookings.service';
import {Booking} from './booking.model';
import {IonItemSliding, LoadingController} from '@ionic/angular';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  loadedBookings: Booking[];
  constructor(private bookingsService: BookingsService,
              private loadingCtrl: LoadingController) { }

  ngOnInit() {
    this.subscriptions.push(this.bookingsService.bookings.subscribe( bookings => {
      console.log(bookings);
      this.loadedBookings = bookings;
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach( subscription => {
      subscription.unsubscribe();
    });
  }

  onCancelBooking(id: string, sliding: IonItemSliding) {
    sliding.close();
    this.loadingCtrl.create({
      message: 'Cancelling booking...'
    }).then(loadingEl => {
      loadingEl.present();
      this.bookingsService.cancelBooking(id)
        .subscribe( () => {
          loadingEl.dismiss();
        });
    });
  }
}
