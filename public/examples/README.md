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

In addition to the examples, this directory also contains migration scripts for updating the structure of JSON files used in the simulation projects. The migration scripts are written in JavaScript and use the Node.js runtime environment. They are located in the `/migrations` directory.

To run this script using Node.js, follow these steps:

1. Open a terminal or command prompt.
2. Navigate to the `/examples` directory.
3. Run the following command:

```bash
node migrations/migrateEx<old_version>_<new_version>.js <filename>
```

Replace `<old_version>` and `<new_version>` with the version numbers of the JSON files you want to migrate and the version you want to migrate to, respectively. 
Replace `<filename>` with the name of the JSON file you want to migrate.

For example, to migrate the `ex1.json` file from version `0.1` to version `0.2`, run the following command:

```bash
node migrations/migrateEx0.1_0.2.js ex1.json
```

The migrated file will be saved in the `/migrations` directory with the same name as the original file.
Backups of the original file will be saved in the `/migrations/temp` directory.

Note that not all version combinations are supported.
The following table shows which versions can be migrated to which other versions:

| From version | To version |
| ------------ | ---------- |
| 0.7          | 0.9        |
| 0.9          | 0.10       |
| 0.10         | 0.11       |