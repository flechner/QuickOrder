import { AlertController } from 'ionic-angular';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

import { Observable } from 'rxjs';
import { _throw } from 'rxjs/observable/throw';
import { catchError, mergeMap } from 'rxjs/operators';


@Injectable()
export class InterceptorProvider implements HttpInterceptor {

    constructor(private storage: Storage, private alertCtrl: AlertController) { }

    // Intercepts all HTTP requests!
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        console.log('intercept Method');
        console.log(request.url);
        let promise = this.storage.get('my_token');
        request.clone({
            setHeaders: {
                'Content-Type': `application/json`
            }
        });
        return Observable.fromPromise(promise)
            .mergeMap(token => {
                let clonedReq = this.addToken(request, token);
                console.log(JSON.stringify(clonedReq));
                //alert(JSON.stringify(clonedReq))
                return next.handle(clonedReq).pipe(
                    catchError(error => {
                        // Perhaps display an error for specific status codes here already?
                        let msg = error.message + ' hier ist der scheiß Fehler';
                        console.log(msg);

                        let alert = this.alertCtrl.create({
                            title: error.name,
                            message: msg,
                            buttons: ['OK']
                        });
                        alert.present();

                        // Pass the error to the caller of the function
                        return _throw(error);
                    })
                );
            });
    }

    // Adds the token to your headers if it exists
    private addToken(request: HttpRequest<any>, token: any) {
        console.log(request.url);
        console.log('addToken Mehtod started');
        console.log(`token: ${token}`);

        if (token !== '') {
            console.log('InterceptorToken: ' + token);
            let clone: HttpRequest<any>;
            clone = request.clone({
                setHeaders: {
                    //'Accept': `application/json`,
                    'Content-Type': `application/json`,
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('now returning clone');

            return clone;
        }
        console.log('addToken Mehtod token undefined');
        return request;
    }
}









// const httpOptions = {
//     headers: new HttpHeaders({
//       'content-type':  'application/json',
//       'data-type': 'json',
//       'method': 'POST'
//       //'reject-unauthorized': 'false'
//       //'Authorization': 'my-auth-token'
//     })
//   };



