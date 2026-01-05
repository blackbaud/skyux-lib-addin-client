import { ClassProvider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expect } from '@skyux-sdk/testing';
import { SkyHelpOpenArgs } from '@skyux/core';
import { SkyThemeService } from '@skyux/theme';
import { AddinClientService } from '../addin-client.service';
import { AddinClientHelpService, provideAddinClientHelp } from './addin-client-help.service';

describe('AddinClientHelpService', () => {
  let addinClientHelpService: AddinClientHelpService;
  let mockAddinClientService: jasmine.SpyObj<AddinClientService>;

  beforeEach(() => {
    const addinClientServiceSpy = jasmine.createSpyObj('AddinClientService', ['openHelp']);

    TestBed.configureTestingModule({
      providers: [
        AddinClientHelpService,
        { provide: AddinClientService, useValue: addinClientServiceSpy }
      ]
    });

    addinClientHelpService = TestBed.inject(AddinClientHelpService);
    mockAddinClientService = TestBed.inject(AddinClientService) as jasmine.SpyObj<AddinClientService>;
  });

  it('should be created', () => {
    expect(addinClientHelpService).toBeTruthy();
  });

  it('should call AddinClientService openHelp when openHelp is called with args', () => {
    const helpArgs: SkyHelpOpenArgs = {
      helpKey: 'test-help-key'
    };

    addinClientHelpService.openHelp(helpArgs);

    expect(mockAddinClientService.openHelp).toHaveBeenCalledWith(helpArgs);
  });

  it('should not call AddinClientService openHelp when openHelp is called without args', () => {
    addinClientHelpService.openHelp();

    expect(mockAddinClientService.openHelp).not.toHaveBeenCalled();
  });

  it('should not call AddinClientService openHelp when openHelp is called with undefined args', () => {
    addinClientHelpService.openHelp(undefined);

    expect(mockAddinClientService.openHelp).not.toHaveBeenCalled();
  });

  it('should throw error when updateHelp is called', () => {
    expect(() => {
      addinClientHelpService.updateHelp();
    }).toThrowError('Not implemented');
  });

  it('should handle openHelp with complex help args', () => {
    const helpArgs: SkyHelpOpenArgs = {
      helpKey: 'complex-help-key',
    };

    addinClientHelpService.openHelp(helpArgs);

    expect(mockAddinClientService.openHelp).toHaveBeenCalledWith(helpArgs);
  });

  describe('provideAddinClientHelp', () => {
    it('should provide correct providers array', () => {
      const providers = provideAddinClientHelp();
      
      expect(providers).toEqual([
        { provide: jasmine.any(Function), useClass: AddinClientHelpService }
      ]);
      
      expect((providers[0] as ClassProvider).provide.name).toBe('SkyHelpService');
      expect((providers[0] as ClassProvider).useClass).toBe(AddinClientHelpService);
    });

    it('should configure service properly when using provider function', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideAddinClientHelp(),
          AddinClientService,
          SkyThemeService
        ]
      });

      // This should not throw an error
      expect(() => {
        const service = TestBed.inject(AddinClientHelpService);
        expect(service).toBeTruthy();
      }).not.toThrow();
    });
  });
});