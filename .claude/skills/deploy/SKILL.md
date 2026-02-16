---
name: deploy
description: Deploy the Astro site to Vercel and/or Sanity studio
disable-model-invocation: true
---

# Deploy

Deploy the necstaz project to production. There are two deployment targets:

## Workflow

1. **Ask the user** which target(s) to deploy:
   - Vercel (Astro site)
   - Sanity Studio
   - Both

2. **Pre-flight check**: Run `npm run build` in the project root to verify the build succeeds before deploying.

3. **Deploy Vercel** (if selected):
   - Run `npx vercel --prod` from the project root
   - Report the deployment URL

4. **Deploy Sanity Studio** (if selected):
   - Load the token from the project `.env` and run the deploy:
     ```bash
     export $(grep SANITY_AUTH_TOKEN /Users/vicus/Projects/necstaz/.env) && cd studio-nextaz && npx sanity@latest deploy
     ```
   - If the command fails due to a missing token, ask the user to add `SANITY_AUTH_TOKEN` to their `.env` file

5. **Report results**: Confirm successful deployments with URLs.
