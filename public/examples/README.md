# Examples directory

This directory contains examples of simulation projects for the editor. To add a new example, create a new JSON file in this directory. The naming convention for the file is as follows:

- ex{number of the example}.json

Please note that the examples must be numbered consecutively.

After creating new example file add it to examplesMap.json file located in 
```bash
src/examples/examplesMap.json
```
Example mapping shown be as followed:

- "Proton pencil beam in water" : "ex1"

Key specifies how example will be shown in front-end app and value is the name of corresponding example file.
Add entry to section of simulator for which examples is created.