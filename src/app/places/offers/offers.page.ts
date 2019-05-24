import {Component, OnDestroy, OnInit} from '@angular/core';
import {Place} from '../place.model';
import {PlacesService} from '../places.service';
import {IonItemSliding} from '@ionic/angular';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  isLoading: boolean;
  offers: Place[];
  private subscriptions: Subscription[] = [];

  constructor(private placesService: PlacesService,
              private router: Router) { }

  ngOnInit() {
    this.subscriptions.push(this.placesService.places.subscribe( places => {
      this.offers = places;
    }));
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  onEdit(offerId: any, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
    console.log('editing ' + offerId);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach( subscription => {
      subscription.unsubscribe();
    });
  }
}
