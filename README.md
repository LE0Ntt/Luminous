# Luminous

Luminous is a state-of-the-art lighting control software developed as a collaborative endeavor under the Web Development and "Projekt Medienproduktionstechnik" curricula at the Cologne University of Applied Sciences.

## Key Features

- **Scene Composition**: A sophisticated interface for designing complex lighting arrangements.
- **Granular Light Control**: Detailed customization options for individual light parameters including brightness, hue, and saturation.
- **Group Synchronization**: Coordinated control over groups of lights for seamless scene transitions.
- **Programmable Lightshows**: Pre-set or custom sequences for dynamic, multi-scene lightshows.
- **Cross-Platform Utility**: Functional across various platforms, with a dedicated Electron app for PCs and a web-based interface for tablets.
- **Haptic Feedback**: Integration with MotorMix hardware for a tactile and interactive user experience.

## Getting Started

### Quick Start: Using the Installer

Download the latest installer for your operating system from the [Releases](https://chat.openai.com/c/LINK_TO_RELEASES_PAGE) page and follow the on-screen instructions to install Luminous. Launch the Electron app to start using Luminous right away.

### For Developers: Complete Setup
#### Prerequisites

- Node.js (v18.15.0)
- Python3 (3.9.2)
- pip3
- **For OLA Support**: [Open Lighting Architecture](https://www.openlighting.org/ola/) needs to be installed separately.

#### Installation Procedure
```bash
# Clone the repository

git clone https://github.com/LE0Ntt/luminous.git

# Change directory to the project root
cd luminous

# Install Node.js dependencies
npm install

# Install Python server dependencies
pip3 install -r requirements.txt

```
#### Execution Steps
```bash
# Initialize the Python server
python3 server.py

# In a new terminal instance, activate the application
npm start dev
```

The application is accessible via the Electron desktop application.

## Contribution Guidelines

As this project was developed for academic purposes and is considered complete, contributions are currently not being solicited. However, the codebase remains open for educational exploration.

## License Information

The project is licensed under the terms of the MIT License.

## Contact Information

For academic or technical inquiries related to Luminous, please contact:

- Leon Hölzel
- Darwin Pietas
- Marvin Plate
- Andree Tomek
