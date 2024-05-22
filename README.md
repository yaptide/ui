# yaptide web interface

## For users

The development version is unstable, without many features and with a lot of bugs.
It is released automatically after every commit to the main branch of this repository and is available for testing here:
<https://yaptide.github.io/web_dev/>

The stable version is not released yet, have patience.

### Loading a project file with results from a URL

You can load a project file with results from a URL by adding `?<project_file_url>` to the end of the editor URL.

```txt
https://<editor_url>?<project_file_url>
```

Example: <https://yaptide.github.io/web_dev/?https://raw.githubusercontent.com/yaptide/ui/master/src/ThreeEditor/examples/ex1.json>

To see the results, you need to navigate to the `Results` tab in the main menu.

## Credits

This project adapts source code from the following libraries:

- CSG javascript library <https://github.com/manthrax/THREE-CSGMesh>
  - parts of its code copied into `src/ThreeEditor/js/libs/csg/`
  - adapted by adding types in a separate file
- ThreeJS Editor <https://threejs.org/editor/>
  - most of its code is copied from [mrdoob's GitHub repo](https://github.com/mrdoob/three.js/tree/r132/editor) into `src/ThreeEditor`, starting from v.132
  - the copied code is heavily adapted to "yaptide needs"

This work was partially funded by EuroHPC PL Project, Smart Growth Operational Programme 4.2
