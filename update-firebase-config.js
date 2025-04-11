// Script to output the firebase configuration instructions
console.log(`
=====================================================
FIREBASE CONFIGURATION INSTRUCTIONS
=====================================================

To configure Firebase authentication:

1. Go to the Firebase console (https://console.firebase.google.com/)

2. Create a new project or select your existing project

3. Add a web app to your project:
   - Click on "Add app" (</> icon)
   - Enter a name for your app (e.g., "Full Fuel TV")
   - Register the app

4. Copy the Firebase configuration values:
   - Find your Firebase SDK config in Project settings > Your apps
   - Add these values to your .env file:
   
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_APP_ID=your_app_id

5. Set up Authentication:
   - In Firebase console, go to Authentication > Sign-in method
   - Enable "Google" as a sign-in provider
   - Add your authorized domain (your Replit app URL)
   - Save changes

6. Add authorized domains:
   - In Firebase Authentication settings, add these domains to "Authorized domains":
     - Your Replit app domain: ${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co
     - localhost

Current Environment Configuration:
---------------------------------
API Key: ${process.env.VITE_FIREBASE_API_KEY ? 'Set ✓' : 'Not set ✗'}
Project ID: ${process.env.VITE_FIREBASE_PROJECT_ID ? 'Set ✓' : 'Not set ✗'}
App ID: ${process.env.VITE_FIREBASE_APP_ID ? 'Set ✓' : 'Not set ✗'}

=====================================================
`);