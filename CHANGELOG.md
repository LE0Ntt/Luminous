# Changelog

> All notable changes to this project will be documented in this file.

## [1.2.0] - Pre-Release

### Changes

- Support for HMI lights that automatically switch on when the aperture is opened
- Faders
  - Controllable with the mouse wheel and arrow keys
  - Value input now displays one decimal place when focused
  - Removed separator line from last element
  - Render DMX channels in steps to reduce lag
  - Prevented the fader track from showing through the fader thumb in the extended fader view
- LightFX
  - Enlarged effects area to fill half the screen
  - Any device channel that could not be controlled in the LightFX is now displayed as an effect fader
  - Only process changed channels
- Settings error/success message on password change
  - Added translation, color indication & fade out
- LightSettings
  - Save with _ENTER_ if no input is focused
  - Switched to SocketIO for save, update, and delete instead of http
  - Updates reload sliders in Studio and devices in LightFX
  - Default number for new devices is last device number + 1
  - Changing device type does not reset DMX range if previously set
  - Switched save and delete buttons
  - Highlight save button
  - Added space between inputs and labels
- About
  - Linked changelog
  - Spiced up the logo with an interactive twist
- Code cleanup
  - Removed unnecessary code
  - Removed Vite files for now
  - Further refinements
- Connection
  - Reduced SocketIO `ping_timeout`
  - Fetch faders, scenes and devices only if connected
  - LightSettings only open if connected
- Input fields
  - Set inputs and buttons to same height
  - Fade out red error outline on faulty inputs
  - Added inset shadow
  - Input value is now selected on focus
- Titlebar small visual touch-ups
- Dropdown menu
  - Added icons (also in dialogs)
  - Added animation
  - Enlarged for easier touch selection
- Appended 's' to scenes fade input value
- Reworked fill light and bi-color light icons
- Set dark mode as default to prevent bright flash on startup
- Updated scene placeholder dashed border to be more symmetrical
- Redesigned dialog close button to look more elegant
- Adjusted colors
  - Separator lines now use the same color
  - Button border and background color more visible
  - Input border less visible
  - Second layer background more transparent

### Fixes

- LightSettings updating device number
  - Fixed device not showing up
  - Fixed error if device number already exists
- MotorMix
  - Hopefully fixed master not updating
  - Hopefully fixed not updating fader backup value

## [1.1.1] - 2023-11-21

### Fixes

- Instant hotfix for production

## [1.1.0] - 2023-11-21

### Changes

- Added No Connection screen and automatically reconnect
- Added ability to click on a device in the Studio-Overview to highlight the fader
- Settings Overhaul
  - Added setting to switch between left- and right-handed Studio-Overview
  - New layout with tabs
  - Coherent spacing
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
- Added ability to confirm dialogs and input fields with _ENTER_
- Input fields can now be empty
  - Input now only takes effect if confirmed (_ENTER_ or click outside the field)
  - Reset to default value if confirmed input is invalid
  - Fader input accepts decimal values, but only displays integers
    - Value with "%" is now always centred
- Changed Electron app loading screen that only appears on slow PCs
- Reworked Help page
  - Added FAQ
  - Linked Quick Guide

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
