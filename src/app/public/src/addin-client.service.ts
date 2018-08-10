import { AddinClient } from '@blackbaud/sky-addin-client';
import { Injectable } from '@angular/core';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import {
  AddinClientInitArgs,
  AddinClientCloseModalArgs,
  AddinClientShowModalArgs,
  AddinClientShowModalResult,
  AddinClientNavigateArgs,
  AddinClientOpenHelpArgs
} from '@blackbaud/sky-addin-client/src/addin/client-interfaces';

@Injectable()
export class AddinClientService {
  public readonly addinClient: AddinClient;
  private _args: AsyncSubject<AddinClientInitArgs> = new AsyncSubject<AddinClientInitArgs>();
  public args: Observable<AddinClientInitArgs> = this._args.asObservable();

  constructor() {
    this.addinClient = new AddinClient({
      callbacks: {
        init: (args: AddinClientInitArgs) => {
          this._args.next(args);
          this._args.complete();
        }
      }
    });
  }

  public closeModal(args: AddinClientCloseModalArgs): void {
    this.addinClient.closeModal(args);
  }

  public showModal(args: AddinClientShowModalArgs): Observable<any> {
    let modalReturn: AddinClientShowModalResult = this.addinClient.showModal(args);
    return Observable.fromPromise(modalReturn.modalClosed);
  }

  public destroy(): void {
    this.addinClient.destroy();
  }

  public navigate(args: AddinClientNavigateArgs): void {
    this.addinClient.navigate(args);
  }

  public openHelp(args: AddinClientOpenHelpArgs): void {
    this.addinClient.openHelp(args);
  }

  public getAuthToken(): Observable<string> {
    return Observable.fromPromise(this.addinClient.getAuthToken());
  }
}
