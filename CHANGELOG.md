# Changelog

All notable changes to this project will be documented in this file.

## [1.0.3] - pre-release

### Changes

- Added No Connection screen and automatically reconnect
- Added ability to click on a device in the Studio-Overview to highlight the fader
- Settings Overhaul
  - Added setting to switch between left- and right-handed Studio-Overview
- Few wording changes
- Scenes: Changed LAYER to SOLO
  - Solo will turn off every other fader except the selected scene
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
  - Resets to default value if confirmed input is invalid
  - Fader input accepts decimal values, but displays only integers
    - Value with "%" is now always centred
- Changed loading screen for Electron app that only appears on slow PCs 🙃

### Fixes

- Fixed buttons in header being too big
- LightSettings
  - Fixed LightSettings background fading in again on admin password
  - Fixed a case where the channels were not displayed
  - Changing the range won't reset channels already edited anymore
- Fixed titlebar for macOS

## [1.0.2] - 2023-09-28

### Changes

- Added Fade In/Out animation for scene transitions
- Added Animation for LightSettings
- Use same CSS for every background overlay
- Disabled nodeIntegration for renderer process, enabled contextIsolation
- Put OLA dependencies into try catch block
- LightFX
  - Bi-color centered and bigger
  - Group selected device values for SocketIO to prevent too many packets
- Removed unused files Connection.tsx, SettingsOla.tsx and SettingsOla.css

### Fixes

- Fixed touch input on faders
- Fixed LightSettings adding new device if deselected
- Fixed settings rendering in background on OLA password
- Various small bug fixes

## [1.0.1] - 2023-08-08

### Changes

- Updated icons
- Launch application in fullscreen

### Fixes

- Various important bug fixes

## [1.0.0] - 2023-07-07

### Initial release
