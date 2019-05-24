import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActionSheetController, AlertController, LoadingController, ModalController, NavController} from '@ionic/angular';
import {CreateBookingComponent} from '../../../bookings/create-booking/create-booking.component';
import {PlacesService} from '../../places.service';
import {Place} from '../../place.model';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {BookingsService} from '../../../bookings/bookings.service';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  place: Place;
  isBookable = false;
  isLoading = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private navCtrl: NavController,
              private modalCtrl: ModalController,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              private actionSheetCtrl: ActionSheetController,
              private authService: AuthService,
              private placesService: PlacesService,
              private bookingService: BookingsService) { }

  ngOnInit() {
    this.isLoading = true;
    this.route.paramMap.subscribe( paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.subscriptions.push(this.placesService.getPlace(paramMap.get('placeId')).subscribe(place => {
        this.place = place;
        this.isBookable = place.userId !== this.authService.userId;
        this.isLoading = false;
      }, err => {
        this.alertCtrl.create({
          header: 'An error occured!',
          message: 'Place could not be fetched.',
          buttons: [ {
            text: 'Ok',
            handler: () => {
              this.router.navigate(['/places', 'tabs', 'offers']);
            }
          }]
        }).then( alertEl => {
          alertEl.present();
        });
      }));
    });
  }

  onBookPlace() {
    // this.navCtrl.navigateBack('places/tabs/discover');
    this.actionSheetCtrl.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(sheetEl => {
      sheetEl.present();
    });
  }

  openBookingModal(mode: 'select'|'random') {
    let resultData = null;
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: {
        selectedPlace: this.place,
        selectedMode: mode
      }
    }).then(modalEl => {
      modalEl.present();
      return modalEl.onDidDismiss();
    }).then( data => {
      resultData = data;
      if (resultData.role === 'confirm') {
        return this.loadingCtrl.create({
          message: 'Booking...'
        });
      }
    }).then(loadingEl => {
      loadingEl.present();
      this.bookingService.addBooking(this.place.id, this.place.title, this.place.imageUrl,
        resultData.data.bookingData.firstName, resultData.data.bookingData.lastName, resultData.data.bookingData.guestNumber,
        resultData.data.bookingData.startDate, resultData.data.bookingData.endDate)
        .subscribe( data => {
          loadingEl.dismiss();
          this.router.navigate(['/', 'bookings']);
        });
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach( subscription => {
      subscription.unsubscribe();
    });
  }
}
