import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http, RequestOptions, HttpModule, RequestMethod } from '@angular/http';
import { HttpHeaders } from '@angular/common/http';
import {HttpClient} from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage';

import {HomePage} from '../home/home';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public username: string;
  public password: string;
  authenticated = false;


  constructor(public navCtrl: NavController, private httpClient: HttpClient, private storage: Storage) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  login(){
    console.log('Login');

    let postData = {
            username: `${this.username}`,
            password: `${this.password}`,
          }


    this.storage.set('my_token', '');


    this.httpClient.post<RequestReply>("http://10.0.0.13:5001/api/token/authenticate", postData)
    .subscribe(data => {
      console.log('Data: ' + JSON.stringify(data));
      console.log('LoginToken: ' + data.token);
      this.storage.set('my_token', data.token);
      this.authenticated = true;
      this.navCtrl.push(HomePage);
      this.navCtrl.setRoot(HomePage); 
    }, error => {
      console.log('Error: ' + error.message);
    });
  }
}

export interface RequestReply {
  username: string;
  password: string;
  token: string;
 }

 //Bauer: http://10.0.2.15:5001/api/token/authenticate
 //Daham: http://10.0.0.13:5001/api/token/authenticate