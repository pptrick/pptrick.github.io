## Install and Build

First transfer to the project directory `src`. To install all the dependencies:

```bash
npm install
```

To run in development mode, run the following command under `src`:
```bash
npm run dev
```
## Fast Deploy (recommended)

If you're using Linux/MacOS, just run `bash deploy.sh` under `src/`.

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
