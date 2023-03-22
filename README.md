# Luminous

PMPT and WEB3 Project

Doku für electron-vite-project

```
\---electron-vite-project
    |
    |   .gitgnore
    |       -was soll von git ignoriert werden... gut zu wissen
    |
    |   .npmrc
    |       -gehört zu npm, weiß nicht ob wir es nutzen mussen/wollen
    |
    |   electron-builder.json5
    |       -macht was der name sagt
    |
    |   index.html
    |       -look inside
    |
    |   LICENSE
    |       -von dem clone, kp ob wir es löschen können
    |
    |   package-lock.json
    |       -von npm für dependencies, DO NOT EDIT
    |
    |   package.json
    |       -settings -> kp ob wir da die sachen ändern, ist vom clone
    |
    |   playwright.config.ts
    |       -siehe unten
    |
    |   postcss.config.js
    |       - von PostCSS, kp ob wir es brauchen/nutzen wollen
    |
    |   README.md
    |       -vom clone
    |
    |   tailwind.config.js
    |       -tailwind config
    |
    |   tsconfig.json
    |       -TypeScript config file
    |
    |   tsconfig.node.json
    |       -TypeScript compiler
    |
    |   vite.config.ts
    |       -configuration file for Vite
    |
    +---build
    |       files for building electron
    |
    +---dist-electron
    |       files for building electron
    |
    +---e2e
    |       E2E ist end-to-end testing, ggf. nicht benötigt.
    |       Bei der Boilerplate wird playwright genutzt. Wird also ggf. noch gelöscht.
    |       Was dazu gehört:
    |       - e2e ordner
    |           - alles was drin ist
    |
    |       - playwright.config.ts
    |
    |       - package.json
    |           "scripts": {
    |               "e2e": "playwright test"
    |           },
    |           "devDependencies": {
    |               "@playwright/test": "^1.31.0",
    |           },
    |       - package-lock.json
    |           mehrere sachen, einfach nach playwright suchen
    |
    +---electron
    |       Electron App
    |       stuff für die App, mehr kommt später
    |
    +---node_modules
    |
    |
    +---public
    |       React modul
    |       -für static stuff bei react (bilder, usw.)
    |
    \---src
            React modul
            -für code stuff bei react (components, assets, usw.)
```
