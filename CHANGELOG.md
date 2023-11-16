# Changelog

All notable changes to this project will be documented in this file.

## [1.0.3] - Pre-release

### Changes

- Added No Connection screen and automatically reconnect
- Added ability to click on a device in the Studio-Overview to highlight the fader
- Settings Overhaul
  - Added setting to switch between left- and right-handed Studio-Overview
- Minor wording changes
- Scenes: Changed LAYER to SOLO
  - Solo turns off every other fader except the selected scene
- Code cleanup
  - Removed unused files
  - Auto-formatted the code for a consistent style
  - Client files
    - Added comments
    - Compressed code
  - Server files
    - Prevented error warnings
    - Added credit header
- Added ability to confirm dialogs and input fields with ENTER
- Input fields can now be empty
  - Input now only takes effect if confirmed (ENTER or click outside the field)
  - Reset to default value if confirmed input is invalid
  - Fader input accepts decimal values, but only displays integers
    - Value with "%" is now always centred
- Changed Electron app loading screen that only appears on slow PCs 🙃

### Fixes

- Fixed buttons in header that were too big
- LightSettings
  - Fixed background fading in again on admin password
  - Fixed a case where the channels were not displayed
  - Changing the range doesn't reset edited channels anymore
- Fixed titlebar for MacOS

## [1.0.2] - 2023-09-28

### Changes

- Added fade in/out animation for scene transitions
- Added animation for LightSettings
- Use the same CSS for each background overlay
- Disabled nodeIntegration for renderer process, enabled contextIsolation
- Put OLA dependencies into try catch block
- LightFX
  - Bi-color centred and larger
  - Group selected device values for SocketIO to avoid too many packets
- Removed unused files Connection.tsx, SettingsOla.tsx and SettingsOla.css

### Fixes

- Fixed touch input on faders
- Fixed LightSettings adding new device when deselected
- Fixed settings rendering in background on OLA password
- Various minor bug fixes

## [1.0.1] - 2023-08-08

### Changes

- Updated icons
- Launch application in full screen

### Fixes

- Various important bug fixes

## [1.0.0] - 2023-07-07

### Initial release
