# Luminous

Luminous is an advanced lighting control software, created through a joint project within the Web Development and "Projekt Medienproduktionstechnik" courses at the Cologne University of Applied Sciences. Currently, it's employed in the studio of the University of Applied Sciences Cologne, located at the Deutz campus.

## Key Features

- **Scene Composition**: A sophisticated interface for designing complex lighting arrangements.
- **Granular Light Control**: Detailed customization options for individual light parameters including brightness, hue, and saturation.
- **Group Synchronization**: Coordinated control over groups of lights for seamless scene transitions.
- **Cross-Platform Utility**: Functional across various platforms, with a dedicated Electron app for PCs and a web-based interface for tablets.
- **Haptic Feedback**: Integration with MotorMix hardware for a tactile and interactive user experience.

## Getting Started

### Quick Start: Using the Installer

Download the latest version for your operating system from the [Releases](https://github.com/LE0Ntt/Luminous/releases). Follow the instructions provided during installation to set up Luminous. The Electron app will be ready for immediate use upon installation.

### For Developers: Complete Setup

A detailed setup guide for developers will be available soon, providing step-by-step instructions to get started with Luminous development.
At the moment, there is an incomplete guide available at [Installation Guide](https://github.com/LE0Ntt/Luminous/blob/Development-v1.2.3/Installation%20guide%20-%20EN.md)

#### Prerequisites

- Node.js (v18 or higher)
- Python3 (3.9.2)
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
pip install -r requirements.txt

```

#### Execution Steps

```bash
# Initialize the Python server
python server.py

# In a new terminal instance, activate the application
npm start dev
```

The application is accessible via the Electron desktop application.

## Contribution Guidelines

Originally developed for academic objectives, Luminous has evolved beyond its initial scope. With version 1.0 serving academic purposes, the project is now actively under development for practical application in the studio. We invite contributions, especially those that support its ongoing use and enhancement in the studio setting. The codebase is open for both educational exploration and active development contributions.

## License Information

The project is licensed under the terms of the MIT License.

## Contact Information

For any inquiries related to Luminous, including academic or technical questions, please contact the current team members:

Leon Hölzel: lhoelzel@th-koeln.de
Darwin Pietas: dpietas@th-koeln.de

Leon and Darwin are actively maintaining and developing Luminous. They were part of the initial team along with Marvin Plate and Andree Tomek, who have since moved on.
