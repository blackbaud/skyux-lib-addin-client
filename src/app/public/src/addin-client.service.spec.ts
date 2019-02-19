import {
  expect
} from '@skyux-sdk/testing';

import { AddinClientService } from './addin-client.service';

describe('Addin Client Service', () => {
  let addinClientService: AddinClientService;

  it('should instantiate an AddinClientService', (done) => {
    addinClientService = new AddinClientService();
    expect(addinClientService.addinClient).toExist();
    done();
  });
});
