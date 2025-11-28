# User Manual

## Requirements

Before installing and running the application, ensure your system meets the following requirements:

- Port **3000** must be available
- **Docker** installed **or** **Node.js & npm** installed

---

## Running the Application

You can run the application using **two methods**:

1. **Docker (Recommended)**
2. **npm (Manual Installation)**

---

## Method 1: Using Docker (Easiest)

Docker allows you to run the application without installing dependencies manually.

### Steps:

1. Open a terminal and pull the Docker image:

   ```bash
   docker pull ngsproject/ngsimage:latest
   ```

2. Run a Docker container with the required environment variables:

   ```bash
   docker run -it \
     -p 3000:3000 \
     -e JWT_SECRET="h3uP4e1N9xS2qW7fL0rT8vB5yZ6mC3aD" \
     -e DATABASE_URL="postgresql://neondb_owner:npg_9ckCPqer4bGo@ep-plain-wind-affk3foe-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" \
     -e AWS_ACCESS_KEY="AKIAU72LGM3RATBU437L" \
     -e AWS_SECRET_KEY="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" \
     -e AWS_REGION="eu-west-1" \
     -e S3_BUCKET_NAME="ngs-project-bucket" \
     -e NPM_TOKEN="glpat-NDAElL0Mynk7vrs76urTHG86MQp1OmI3CA.01.0y0t73y7k" \
     ngsproject/ngsimage:latest
   ```

3. Once the container is running, you can start using the app immediately by accessing its endpoints on **port 3000**.

---

## Method 2: Using npm (Manual Installation)

If you prefer installing the application manually, follow these steps:

### 1. Initialize a Node.js project

```bash
mkdir app-test
cd app-test
npm init -y
```

### 2. Configure npm registry

Create a `.npmrc` file:

```bash
touch .npmrc
```

Add the following content to `.npmrc`:

```text
@ngs:registry=https://im2ag-gitlab.univ-grenoble-alpes.fr/api/v4/projects/466/packages/npm/
//im2ag-gitlab.univ-grenoble-alpes.fr/api/v4/projects/466/packages/npm/:_authToken=glpat-NDAElL0Mynk7vrs76urTHG86MQp1OmI3CA.01.0y0t73y7k
```

### 3. Install the application

```bash
npm install @ngs/team_05-template@latest
```

### 4. Configure environment variables

Create a `.env` file:

```bash
touch .env
```

Add the following environment variables:

```text
JWT_SECRET=h3uP4e1N9xS2qW7fL0rT8vB5yZ6mC3aD
DATABASE_URL=postgresql://neondb_owner:npg_9ckCPqer4bGo@ep-plain-wind-affk3foe-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
AWS_ACCESS_KEY=AKIAU72LGM3RATBU437L
AWS_SECRET_KEY=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
AWS_REGION=eu-west-1
S3_BUCKET_NAME=ngs-project-bucket
NPM_TOKEN=glpat-NDAElL0Mynk7vrs76urTHG86MQp1OmI3CA.01.0y0t73y7k
```

### 5. Create the entry point

Create `index.js`:

```bash
touch index.js
```

Add the following line to `index.js`:

```javascript
import Server from "@ngs/team_05-template";
```

### 6. Launch the application

```bash
node index.js
```

The application will now be running and accessible on **port 3000**.

---
