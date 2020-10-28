# 3.2.0 (2020-11-30)
- Deprecate help widget related functionality.

# 3.1.0 (2020-11-05)
- Add event handler for processing events sent from the add-in host.

# 3.0.0 (2020-06-10)
- Added support for SKY UX 4 and Angular 9.
- Updated library to use RxJS 6 syntax.

# 2.0.11 (2020-05-07)
- Upgraded sky-addin-client
- Added `updateContext` callback to notify add-in when context information has been updated.

# 2.0.10 (2020-04-24)
- Upgraded sky-addin-client
- Added `showWait` and `hideWait` to allow developers to show/hide a full page wait indicator.

# 2.0.9 (2020-04-03)

- Upgraded packages.

# 2.0.8 (2020-03-05)

- Added AddinModalConfig with optional fullPage property (Default: false) to indicate if a modal add-in will be displayed full page.

# 2.0.7 (2019-10-04)

- Added `removeInset` property to `AddinTileConfig` to specify whether the tile content inset should be removed
which allows the content to extend all the way to the edge of the tile container (Default: false)

# 2.0.6 (2019-05-14)

- Added a `showConfirm` method to allow developers to show a confirm dialog with a title, description body,
and button configuration containing custom actions to return when the dialog closes.
- Added a `showError` method to allow developers to show an error dialog with a title, error description, and
text for the close button.

# 2.0.5 (2019-05-03)

- Added a `closeFlyout` method to allow developers to close a flyout panel.
- Return an Observable from the `showFlyout` method which will notify when the flyout has closed.

# 2.0.4 (2019-04-16)

- Added a `showFlyout` method to allow developers to display supplementary information in a flyout panel.

# 2.0.3 (2019-03-01)

- Added a `showToast` method to allow developers to show a toast with a provided message and toast style.

# 2.0.2 (2019-03-01)

- Fixed peer dependencies to not reference invalid version of `@blackbaud/sky-addin-client`.
- Fixed peer dependencies to not reference `@skyux-sdk/builder` at all, since the consumer would not need to install SKY UX Builder to use this library.

# 2.0.1 (2019-02-26)

- Fixed peer dependencies to reference the correct version of `@blackbaud/sky-addin-client@^2.0.0`.

# 2.0.0 (2019-02-25)

- Migrated to SkyUX 3.  You must be on SkyUX 3 to consume this library.  SkyUX 2 libraries and applications should continue using v1.x.

# 1.1.3 (2019-02-21)

- Adding support for tile and button config arguments as part of initializing an addin.
- Adding support for handling tile help and settings clicks and button clicks.

# 1.1.2 (2018-08-13)

- Updated to list `sky-addin-client` as a peer dependency, using carat semver notation.

# 1.1.1 (2018-08-13)

- Updated to latest `sky-addin-client` to leverage root level barrels; improved readme content.

# 1.1.0 (2018-08-10)

- Initial public release.
