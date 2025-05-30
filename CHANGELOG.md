# Changelog

> All notable changes to this project will be documented in this file.

## [1.2.4] - 2025-05-14

### Changes

- Web version
  - Added a web version of the app that can be run in a browser
  - To run it, enter the IP of the PI and port in a browser, e.g. `http://192.168.2.119:5000`
- Studio-Overview refactor
  - Added settings to fully customise the layout
  - Bi-color and RGB glare now roughly represents the color of the light
  - RGB lamps can now be placed anywhere in the studio
- Added the ability to change the server port
- Scenes
  - Display an icon if scene is 'out of sync'
  - Active scenes are stored as a stack to prevent overlapping
- LightSettings 
  - Selected device now has the icon of the selected device type
  - Brought back transition on selection
- LightFX
  - Added a new bi-color slider with higher resolution
    - Added support for scroll wheel and arrow keys
- Added a third new design for the app called 'Minimal'
- Code and assets refactoring

### Fixes

- Fixed a server startup bug
- Fixed scenes not reloading after server restart
- Fixed HMI lights turning off with scenes (in DB)
- Fixed LightFX list not always reloading on device edit
  - No longer resetting the selected list
- Fixed newly added device missing initial channel values
- Fixed BigView overlaying the NoConnection screen
- Fixed misc icon not displayed
- LightFX
  - Fixed Out-of-Sync (OOS) button not working consistently 
  - Fixed OOS button flashing on every added device
  - Fixed unwanted fader synchronisation
  - Fixed ugly selection box corner blinking
  - Fixed bi-color fader inaccuracy

## [1.2.3] - 2024-06-26

### Changes

- Updated dependencies
- Added DMX occupancy overview to LightSettings
- Scenes
  - Are 'on' when created
  - Show fewer placeholder scenes in grid
- LightFX
  - Implemented buffering of changes, now sent every 20ms to prevent stuttering
  - Transfer the values of the first light of its kind to the corresponding LightFX faders
  - Added input field for bi-color
  - Bi-color and RGB areas are now blurred if not supported by the selection
  - Various visual tweaks
  - Added 'out of sync' button for devices that are not in the current state of the selection
  - Split updates of selection between 'main' and RGB/bi-color
- Fader
  - Completely overhauled fader implementation to prevent rerendering on fader change
    - This improves performance drastically and makes the app usable on slower devices
    - Prevent stuttering when multiple clients are connected
  - More obvious fader highlighting when selected in Studio-Overview
  - Reworked spacing
    - First and last faders in a row now have a smaller gap to the edge
    - Vertical spacing is now more consistent
- BigView
  - Added outline around all channels of a device
  - RGB faders have appropriate color
  - Channel or device toggle resets to device view after session
- Design
  - Added a new theme that can be selected in the settings
  - Adjusted font weights to be thinner in some places
  - Desaturated light mode background
  - Improved spacing consistency
  - Adjusted Settings layout for different window sizes
- Added traverse lights to Studio-Overview with RGB support
- Settings
  - Admin page is now only accessible with the admin password
  - Added settings to backup, reset and restore the database
  - Added setting to change the client-side server IP
  - OLA now opens in its own window instead of browser
- Many code cleanups and improvements

### Fixes

- Fixed scenes not fading in exact seconds as they were subject to server performance
- Fixed a bug where the master fader incorrectly adjusted the channels of scene devices
- Fixed inability to access admin password protected settings when database is empty
- MotorMix
  - Fixed blackout button crashing the driver
  - Fixed unassigned quick-scene buttons crashing the driver
  - Fixed mismatching fader values between MotorMix and the app
  - Fixed display values missing after many concurrent changes

## [1.2.2] - 2024-01-09

### Changes

- Reverted new fader inplementation to v1.1.1 because of lag
- New MIDI-Interface support

### Fixes

- Fixed invisible div covering faders in Studio
- Various minor bug fixes to improve stability

## [1.2.1] - 2023-12-20

### Changes

- Closing the application turns off all lights. When the app is reopened, the user is asked if the session should be restored or reset
- Faders
  - Input fields are now larger and include '%' symbol for easier touch input and have a subtle background
  - Introduced compact-style scroll buttons for easier navigation through faders
- Added HMI 14 to Studio-Overview
- Reverted LightFX only sending changed channels, because every grouped light should be updated the same way
- Minor adjustments

### Fixes

- Fixed full-screen icon not always reflecting the current state

## [1.2.0] - 2023-12-14

### Changes

- Support for HMI lights that automatically switch on when the aperture is opened
- Faders
  - Controllable with the mouse wheel and arrow keys
  - Value input now displays one decimal place when focused
  - Removed separator line from last element
  - Render DMX channels in steps to reduce lag
  - Prevented the track from showing through the thumb in the extended fader view
- LightFX
  - Enlarged effects area to fill half the screen
  - Any device channel that could not be controlled in the LightFX is now displayed as an effect fader
  - Only process changed channels
- Studio-Overview
  - Rearranged layout to reflect the studio
  - Updated bi-color and spot light icons
  - Background image refined
  - Changed correct icon for the devices, added fill light icon
- Settings
  - Error/success message on password change
    - Added translation, color indication & fade out
  - Changed layout
  - Added icons for each setting
- LightSettings
  - Save with _ENTER_ if no input is focused
  - Switched to SocketIO for save, update, and delete instead of http
  - Updates reload sliders in Studio and devices in LightFX
  - Default number for new devices is last device number + 1
  - Changing device type does not reset DMX range if previously set
  - Switched save and delete buttons and highlight save button
  - Spacing changes
- About
  - Linked changelog
  - Spiced up the logo with an interactive twist
- Code cleanup
  - Removed unnecessary code
  - Removed Vite files for now
  - Further refinements
- Connection
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
  - Removed lines between items
- Scenes
  - Solo only turns off main fader of each device
  - Appended 's' to fade input value
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
    - Value with '%' is now always centred
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
- Launch application in full-screen

### Fixes

- Various important bug fixes

## [1.0.0] - 2023-07-07

### Initial release
