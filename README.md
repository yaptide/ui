# yaptide web interface

## For users

The development version is unstable, without many features and with lot o bugs.
It is released automatically after every commit to the main branch of this repository and is available for testing here:
https://yaptide.github.io/web_dev/

The stable version is not released yet, have patience.

## For developers

Before starting the local version of the web interface, you need to install the necessary dependencies by typing:

```bash
npm install
```

To run the app in the development mode, type:

```bash
npm run start
```

Then open [http://localhost:3000/web_dev](http://localhost:3000/web_dev) to view it in the web browser.

The page will reload if you make edits.

## Credits

This project adapts source code from the following libraries:

-   CSG javascript library https://github.com/manthrax/THREE-CSGMesh
    -   parts of its code copied into `src/ThreeEditor/js/libs/csg/`
    -   adapted by adding types in separate file
-   ThreeJS editor https://threejs.org/editor/
    -   most of its code copied from [github mrdoob repo](https://github.com/mrdoob/three.js/tree/r132/editor) into `src/ThreeEditor`, starting from v.132
    -   most of copied code adapted to yaptide needs

This work was partially funded by EuroHPC PL Project, Smart Growth Operational Programme 4.2