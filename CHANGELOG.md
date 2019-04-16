# 2.0.4 (2019-04-16)

- Added a `showFlyout` callback to allow developers to display supplementary information in a flyout panel.

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
