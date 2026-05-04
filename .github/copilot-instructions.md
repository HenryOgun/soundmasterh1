# AI Coding Assistant Instructions

## Architecture Overview

This repository contains a Wix-based portfolio site with integrated backend services, alongside independent full-stack projects for learning purposes.

### Wix Site Structure (`src/`)
- **Frontend**: `src/pages/` - Page-specific code using Velo framework
- **Backend**: `src/backend/` - Server-side logic, APIs, and data hooks
- **Assets**: `src/public/` - Static files served by Wix
- **Development**: Use `wix dev` for local development, `wix sync-types` postinstall

### Independent Projects (`code/`)
- **React Apps**: Vite + React + Tailwind CSS (e.g., Soundmasterh1 portfolio)
- **Express APIs**: MongoDB + Mongoose + JWT authentication
- **Assignments**: HTML/CSS/JS exercises and final projects

## Development Workflows

### Git Workflow
- Work on personal branch (e.g., `henry-branch`)
- Create feature branches: `git checkout -b henry-assignment-name`
- Push and create PRs to personal branch for instructor review
- Commands: `git add code/`, commit, push, then create PR

### Project-Specific Commands
- **Wix Site**: `npm run dev` (runs `wix dev`)
- **React Projects**: `npm run dev` (Vite), `npm run build`, `npm run preview`
- **Express APIs**: `npm run dev` (nodemon), `npm start`, `npm test`

## Code Patterns & Conventions

### Express.js APIs
- **Structure**: `models/` (Mongoose schemas), `controllers/` (business logic), `routes/` (endpoint definitions), `middleware/` (auth/validation)
- **Database**: MongoDB connection in `db.js`, use `dbConnect()` in `app.js`
- **Auth**: JWT tokens, bcrypt password hashing, salt rounds from env
- **Validation**: Manual checks in controllers, return 400 for invalid input
- **Responses**: JSON with `{error}` or `{message}` fields, appropriate HTTP status codes
- **CORS**: Configured for localhost:3000 in development

### React Applications
- **Components**: Functional components with hooks, PascalCase naming
- **Styling**: Tailwind CSS classes, responsive design with `md:`, `lg:` prefixes
- **Routing**: React Router DOM, routes defined in `App.jsx`
- **Icons**: Lucide React icons imported individually
- **State**: Local state with `useState`, no global state management yet

### General Patterns
- **Modules**: ES6 imports/exports, no CommonJS
- **Environment**: `.env` files for secrets, loaded with `dotenv`
- **Error Handling**: Try/catch blocks, specific error messages
- **File Structure**: Consistent organization (components/, pages/, models/, etc.)

## Integration Points

### Wix Backend
- Web modules (`.jsw`) expose functions to frontend
- Permissions managed in `permissions.json`
- Import backend code: `import { func } from 'backend/file.jsw'`

### API Communication
- Fetch requests from frontend to Express APIs
- CORS enabled for cross-origin requests
- JWT tokens stored in localStorage or cookies

## Common Tasks

### Adding New API Endpoints
1. Define Mongoose schema in `models/`
2. Create controller functions in `controllers/`
3. Add routes in `routes/` with proper middleware
4. Import and use routes in `app.js`

### Creating React Components
1. Create `.jsx` file in `components/` or `pages/`
2. Use functional component syntax with arrow functions
3. Apply Tailwind classes for styling
4. Export as default

### Database Operations
- Use async/await with Mongoose queries
- Populate references when needed
- Handle connection errors gracefully

## Key Files to Reference

- `src/backend/README.md` - Wix backend structure
- `code/blog-api/app.js` - Express app setup example
- `code/Soundmasterh1/src/App.jsx` - React routing example
- `git-resources/git-steps.md` - Complete git workflow
- `troubleshooting.md` - Debugging strategies</content>
<parameter name="filePath">/Users/henryogun/soundmasterh1/soundmasterh1/.github/copilot-instructions.md