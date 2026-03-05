# Symmetry Game – Local Setup Guide

This project is built using **Vite**. Follow the steps below to run the project locally.

---

# 1. Install Node.js

Download and install **Node.js (LTS recommended)** from:
https://nodejs.org/

Verify installation:

```
node -v
npm -v
```

---

# 2. Clone the Repository

```
git clone <repository-url>
cd <project-folder>
```

---

# 3. Checkout the `local-run` Branch

```
git checkout local-run
```

If the branch does not exist locally:

```
git fetch origin
git checkout -b local-run origin/local-run
```

---

# 4. Install Dependencies

```
npm install
```

---

# 5. Run Development Server

```
npm run dev
```

Then open:

```
http://localhost:5173
```

---

# 6. Build Production Version

```
npm run build
```
PWA features are not available in development mode, so you must build the production version.
This creates the optimized production build.

---

# 7. Preview Production Build

```
npm run preview
```

Open:

```
http://localhost:4173
```

---

# Available Scripts

```
npm run dev       # start development server
npm run build     # create production build
npm run preview   # preview production build
npm run lint      # run ESLint
```

---

# Command Summary

```
git clone <repository-url>
cd <project-folder>
git checkout local-run
npm install
npm run dev
```
