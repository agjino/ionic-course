import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, NgForm, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {PlacesService} from '../../places.service';
import {AlertController, LoadingController, NavController} from '@ionic/angular';
import {Place} from '../../place.model';
import {Alert} from 'selenium-webdriver';
import {catchError} from 'rxjs/operators';
import {of} from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit {
  isLoading = true;
  form: FormGroup;
  place: Place;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private navCtrl: NavController,
              private alertCtrl: AlertController,
              private loadingCtrl: LoadingController,
              private placesService: PlacesService) { }

  ngOnInit() {
    this.route.paramMap.subscribe( paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.isLoading = true;
      this.placesService.getPlace(paramMap.get('placeId'))
        .subscribe(place => {
          this.place = place;
          this.form = new FormGroup({
            title: new FormControl(this.place.title, {
              updateOn: 'blur',
              validators: [Validators.required]
            }),
            description: new FormControl(this.place.description, {
              updateOn: 'blur',
              validators: [Validators.required, Validators.maxLength(180)]
            })
          });
          this.isLoading = false;
        }, error => {
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
        });
    });
  }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl.create({
      message: 'Updating place...'
    }).then(loadingEl => {
      loadingEl.present();
      this.placesService.updatePlace(this.place.id, this.form.value.title, this.form.value.description)
        .subscribe( () => {
          loadingEl.dismiss();
          this.router.navigate(['/', 'places', 'tabs', 'offers']);
        });
    });
  }
}
