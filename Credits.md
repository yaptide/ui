## Credits

This project adapts source code from the following libraries:

-   CSG javascript library <https://github.com/manthrax/THREE-CSGMesh>
    -   parts of its code copied into `src/ThreeEditor/js/libs/csg/`
    -   adapted by adding types in a separate file
-   ThreeJS Editor <https://threejs.org/editor/>
    -   most of its code is copied from [mrdoob's GitHub repo](https://github.com/mrdoob/three.js/tree/r132/editor) into `src/ThreeEditor`, starting from v.132
    -   the copied code is heavily adapted to "yaptide needs"
-   Keycloak-react-web <https://www.npmjs.com/package/keycloak-react-web>
    -   most of its code was copied from <https://github.com/keycloak-react/keycloak-react/tree/main/src/keycloak> into `src/util/keycloak`
    -   adapted to newer version of react and keycloak-js

This work was partially funded by EuroHPC PL Project, Smart Growth Operational Programme 4.2
