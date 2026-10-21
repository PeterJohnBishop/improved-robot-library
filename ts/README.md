# TS PROJECT

Initialize a node project:

```bash
npm init -y
```

Install typescript with tsx, concurrently, and nodemon:

```bash
npm install -D typescript @types/node tsx concurrently nodemon 
```

Initialize a typescript project:

```bash
npx tsc --init
```

Create the app entry point:

```bash
mkdir src
touch src/index.ts 
```

Update package.json with convenience scripts:

```json
"scripts": {
    "dev": "concurrently \"npm:type-check:watch\" \"npm:dev:server\"",
    "dev:server": "tsx watch src/index.ts",
    "type-check:watch": "tsc --noEmit --watch",
    "build": "tsc",
    "start": "node dist/index.js"
  },
```
