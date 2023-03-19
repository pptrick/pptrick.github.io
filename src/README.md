## Install and Build

First transfer to the project directory `src`. To install all the dependencies:

```bash
npm install
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

After `export`，add an empty file `.nojekyll`  to `src/out/`.

