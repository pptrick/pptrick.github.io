## Install and Build

First transfer to the project directory `src`. To install all the dependencies:

```bash
npm install
```

To run in development mode, run the following command under `src`:
```bash
npm run dev
```

## deploy
First build public files:
```
npm run build
```
Then export to static files:
```
npm run export
```
It will create a directory `src/out/`, which contains static files.

After `export`，create an empty file `.nojekyll`  under `src/out/`.

