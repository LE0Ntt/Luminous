### Known Issues

- MotorMix
  - Black-Out button
  - Display bugs with page wheel
  - Missing light values
  - Displays only two pages until switched to Scenes and back
  - Faders sometimes jump randomly
- Random server crashes
- No connection on autostart _[should be fixed in prebuild v1.0.3]_
- Possibly slower after long operation
- Studio-Overview just uses ID, not universe

### Necessary changes

- [ ] Code cleanup / comments
  - [ ] Components
    - [x] About.tsx
    - [ ] AddScene.css
    - [ ] AddScene.tsx
    - [ ] AdminPassword.tsx
    - [ ] BigView.css
    - [ ] BigView.tsx
    - [ ] Button.css
    - [x] Button.tsx
    - [ ] ColorPicker.tsx
    - [ ] ConnectionContext.tsx
    - [ ] ControlHandler.tsx
    - [ ] DeleteScene.tsx
    - [ ] DeviceList.css
    - [ ] DeviceList.tsx
    - [x] DropDown.css
    - [x] DropDown.tsx
    - [ ] Fader.css
    - [x] Fader.tsx
    - [ ] FaderContext.tsx
    - [ ] Header.css
    - [ ] Header.tsx
    - [x] Help.tsx
    - [ ] LightSettings.css
    - [ ] LightSettings.tsx
    - [x] NewSettings.tsx
    - [ ] NoConnection.css
    - [ ] NoConnection.tsx
    - [ ] Settings.css
    - [ ] Settings.tsx
    - [ ] Timeline.css
    - [ ] Timeline.tsx
    - [ ] Titlebar.css
    - [x] Titlebar.tsx
    - [ ] Toggle.css
    - [ ] Toggle.tsx
    - [ ] TranslationContext.tsx
  - [ ] App.tsx
  - [ ] Color.css
  - [ ] Color.tsx
  - [ ] Control.css
  - [ ] Control.tsx
  - [ ] index.css
  - [ ] main.tsx
  - [ ] Scenes.css
  - [ ] Scenes.tsx
  - [ ] Show.css
  - [ ] Show.tsx
  - [ ] Studio.css
  - [ ] Studio.tsx
- [ ] Testing phase
- [ ] Settings
  - [ ] Studio-Overview
  - [x] Rework Layout
  - [ ] Add different settings
    - [ ] Change IP
    - [ ] No animations
- [ ] MotorMix
  - [ ] Mute
  - [ ] Solo
  - [ ] All channels of a device
  - [ ] Reboot MotorMix
  - [ ] Detect MotorMix (start after App)
- [x] Connection screen
- [x] Reconnect to server
- [x] Guide / Implement Help
  - [x] Quick Start Guide
  - [ ] Finetune Quick Start Guide
- [ ] LightFX
  - [ ] Change to current state of the first light
  - [ ] Effects
  - [ ] Device list server updates
- [ ] PI
  - [ ] Production server
  - [ ] Shutdown button
  - [ ] Turn off all devices during shutdown
  - [ ] Config file for server.py (change ip and so on)
- [ ] Everything off scene - How to implement?
- [ ] Admin
  - [ ] Change password
- [x] Input can be empty
- [x] Use **Enter** to accept dialog
- [ ] Rethink scene logic: Off after e.g. bi-colour change?
- [ ] Add support for Wifi-Lights and devices with an On/Off channel

### Nice to have features

- [ ] Show site (Lightshows)
- [ ] Scenes different colors
- [ ] Change scene fade in/out curve
- [ ] Vite Export, use App within the browser
- [ ] Rework close button
- [ ] Studio-Overview
  - [x] Device highlight
  - [x] Move to the left
  - [ ] Add Traversenlights
- [ ] Scenes
  - [ ] See what you save
  - [ ] Edit scenes
  - [ ] Save master fader?
- [ ] Mute / Solo
  - [ ] Implement solo & mute
  - [ ] Gray out faders
- [ ] LightFX
  - [ ] Save scene, only current group or everything
  - [ ] Bi-Color presets
- [ ] Light Settings
  - [ ] Bi-Color range / calibration
- [ ] Add support for different lights in the studio
  - [ ] Arri Sky panel
  - [ ] Astera Titan Tubes
- [ ] Look into npm packages