import { Component } from '@angular/core';
import { NavController, DateTime } from 'ionic-angular';
import { Dialogs } from '@ionic-native/dialogs';
import { AlertController } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { ResponseType } from '@angular/http';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  price: number;
  name: string;
  tableNr: number;
  waiterId: number = 1;
  orderId: number;
  amount: number = 1;
  prodName: string;
  prodPrice: number;
  products: Array<string>;
  allProducts: Array<ProductRequestReply> = new Array();
  showList: boolean = false;

  constructor(public navCtrl: NavController, private dialogs: Dialogs, private httpClient: HttpClient, private alertCtrl1: AlertController) { }


  productAddClick() {
    console.log('Product add');
    this.amount++;
  }

  productRemoveClick() {
    console.log('Product remove');
    if(this.amount<=1){
      alert('Menge darf nicht kleiner als 1 sein!');
      this.amount = 1;
    }else{
      this.amount--;
    }
  }

  productDeleteClick() {
    console.log('Product delete');
  }

  ionViewDidLoad() {
    console.log('HomePage geladen');
    this.getProducts();
  }

  setItems() {
    //this.items = ['Orange', 'Banana', 'Pear', 'Tomato', 'Grape', 'Apple', 'Cherries', 'Cranberries', 'Raspberries', 'Strawberries', 'Watermelon'];

  }

  getProducts() {
    this.httpClient.get<ProductRequestReply[]>('http://10.0.0.13:5001/api/products', { responseType: 'json' }) //http://10.0.2.15:5001/api/token/authenticate
      .subscribe(data => {
        console.log('Data json: ' + JSON.stringify(data));
        console.log('Data: ' + data);
        for(let item of data){
          console.log(item);
          this.allProducts.push(item);
        }
        this.products = data.map(x => x.name);
        console.log('Alle Produkte: ' + this.allProducts);
        
      }, error => {
        console.log('Error: ' + error.message);
      });
  }

  filterItems(ev: any) {
    this.setItems();
    let val = ev.target.value;
    console.log('Filter value: ' + val);
    
    if (val && val.trim() !== '') {
      this.products = this.products.filter(function (item) {
        console.log('item -> ' + item);
        return item.toLowerCase().includes(val.toLowerCase());
      });
      this.showList = true;
    } else {
      // hide the results when the query is empty
      this.showList = false;
    }
  }

  productSelected(item: string) {
    console.log('Produkt ausgewählt' + item);
    for(let prod of this.allProducts){
      console.log('ProductSelected: ' + prod.name);
      if(prod.name==item){
        //in table einfügen
        this.prodName = prod.name;
        this.prodPrice = prod.price;
      }
    }
  }

  removeOrders() {
    this.dialogs.confirm("Wollen sie die Bestellung wiklich abbrechen?", "Bestellung abbrechen", ['Abbrechen', 'Bestätigen'])
      .then(function (buttonIndex) { //no button = 0; 'Abbrechen' = 1, 'Bestätigen' = 2
        var btnIndex = buttonIndex;
        console.log(btnIndex);
        if (btnIndex == 2) {
          var elmtTable = document.getElementById('Orders');
          var tableRows = elmtTable.getElementsByTagName('tr').length;

          while (elmtTable.lastChild != elmtTable.firstChild) {
            elmtTable.removeChild(elmtTable.lastChild);
          }
        }
      }).catch(e => console.log('Fehler beim Anzeigen des Dialogs', e));
  }

//{"orderId": 16, "timestamp": "2018-11-29T13:51:50.0753578+01:00", "tableNr": 1, "waiterId": 1, "status": 0, "orderPositions": [] }
  sendOrder() {
    console.log("Bestellung senden");
    let orderPostData = {
      tableNr: `${this.tableNr}`,
      waiterId: `${this.waiterId}`
    };
    this.httpClient.post<OrderRequestReply>("http://10.0.0.13:5001/api/orders", orderPostData)
    .subscribe(data => {
      console.log('Order: ' + JSON.stringify(data)); 
      this.orderId = data.orderId;
     console.log('OrderId after set -> ' + this.orderId);
    }, error => {
      console.log('Error: ' + error.message);
    });

    //POST Abrufe ineinander machen um orderId zu erhalten!
    
    //api/orders/5/positions
    let orderPostitionPostData = {
      productId: `1`, //noch dynamisch setzen
      amount: `${this.amount}`
    }; 
    console.log('OrderId before post -> ' + this.orderId);
    this.httpClient.post(`http://10.0.0.13:5001/api/orders/${this.orderId}/positions`, orderPostitionPostData)
    .subscribe(data => {
      console.log('OrderPosition: ' + JSON.stringify(data));
      
    }, error => {
      console.log('Error: ' + error.message);    
    })
  }
}

export interface ProductRequestReply {
  productId: number;
  name: string;
  price: number;
  categoryId: number;

}

export class OrderRequestReply{
  orderId: number;
  timestamp: DateTime;
  tableNr: number;
  waiterId: number;
  status: number;
  orderPositions: string[];
}
