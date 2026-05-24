# Sanity Studio Setup

Follow these steps once to connect your website to the CMS.

---

## Step 1 — Create a Sanity account and project

1. Go to https://sanity.io and sign up for a free account
2. Click **Create new project**
3. Name it **Henry Ogun Blog**, choose the free plan
4. Copy your **Project ID** from the dashboard (looks like `abc12def`)

---

## Step 2 — Install the Studio and run it locally

Open a terminal, go into the `studio` folder and install:

```bash
cd code/henryogun-professional-blog2/studio
npm install
```

Add your Project ID to the Studio. Create a file called `.env` inside the `studio` folder:

```
SANITY_STUDIO_PROJECT_ID=your_project_id_here
```

Then start the Studio:

```bash
npm run dev
```

It will open at `http://localhost:3333` — log in with your Sanity account.

---

## Step 3 — Connect the website frontend

In the root of `henryogun-professional-blog2`, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your Project ID:

```
VITE_SANITY_PROJECT_ID=your_project_id_here
```

---

## Step 4 — Get a Write Token (for publishing from the website)

The website has a built-in admin panel (triple-click the section title to unlock it). To save new articles/projects directly from the website, you need a write token:

1. Go to https://sanity.io/manage → your project → **API** → **Tokens**
2. Click **Add API token**
3. Name it `Website Write`, set role to **Editor**
4. Copy the token and add it to your `.env`:

```
VITE_SANITY_WRITE_TOKEN=your_token_here
```

---

## Step 5 — Allow your website domain

1. Sanity dashboard → **API** → **CORS Origins**
2. Add your website URL, e.g. `https://henryogun.com`
3. Tick **Allow credentials**

---

## Step 6 — Deploy the Studio (optional)

To access the admin panel from any browser without running it locally:

```bash
cd studio
npm run deploy
```

It will be available at `https://your_project_id.sanity.studio`.

---

## How to publish content

### From the Studio (recommended for long articles)

Open `http://localhost:3333` (or your deployed studio URL), click **New document**, choose the type, fill in the fields, and click **Publish**.

### From the website directly

- On the **Articles** page — triple-click the word "Articles" to unlock admin mode
- On **Broadcast Projects** / **Tech Projects** — triple-click the page title
- Enter password: `SoundMasterH1@Admin`
- Click **Add New Article** / **Add New Project** and fill in the form

Content appears live immediately after saving.
