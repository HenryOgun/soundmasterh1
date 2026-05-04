# Sanity Studio Setup

## One-time setup (5 minutes)

1. Go to https://sanity.io and create a free account
2. Create a new project — name it "Henry Ogun Blog"
3. Copy your **Project ID** from the dashboard
4. Run this in the terminal from the project root:

```bash
npm install -g @sanity/cli
sanity init --project YOUR_PROJECT_ID --dataset production --output-path studio
```

5. Create a `.env` file in the root of henryogun-professional-blog2:

```
VITE_SANITY_PROJECT_ID=your_project_id_here
```

6. In Sanity dashboard → API → CORS origins → add your website domain (e.g. https://henryogun.com)

## Writing articles

Visit: https://YOUR_PROJECT_ID.sanity.studio

Log in with your Sanity account and click "Create new article".
Articles appear on the live site immediately — no uploads needed.
