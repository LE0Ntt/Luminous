# Changelog

All notable changes to this project will be documented in this file.

## [1.0.2] - 2023-09-28

### Added

- Fade In/Out animation for scene transitions

### Changed

- Disabled nodeIntegration for renderer process, enabled contextIsolation
- Put OLA dependencies into try catch block
- Added animation for LightSettings

### Fixed

- Fixed set_channel_values() call in routes.py
- Fixed typo in socket_events.py
- Fixed touch input
- Fixed CSS overlay backgrounds
- Fixed group devices for socktetIO
- Fixed LightSettings if deselected
- Use AdminPassword for OLA

### Removed

- Removed Connection.tsx
- Removed SettingsOla.tsx
- Removed SettingsOla.css

## [1.0.1] - 2023-08-08

### Fixed

- Various bug fixes

## [1.0.0] - 2023-07-07

### Added

- Initial release
