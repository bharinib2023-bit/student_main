# Student Form

Angular + Auth0 (login) + Firebase Hosting (frontend) + MongoDB (database) + Dropbox (photo storage).

```
student-project/
  backend/    Node + Express API (MongoDB CRUD, Dropbox upload, Auth0 token check)
  frontend/   Angular app (Auth0 login, student form + table)
```

Firebase Hosting only serves static files, so the Angular app goes on Firebase
and the small API goes on a free Node host such as Render.

## 1. Auth0

1. Create a **Single Page Application**.
   Set Allowed Callback URLs, Allowed Logout URLs and Allowed Web Origins to `http://localhost:4200`
   (add your Firebase URL later).
2. Go to **APIs -> Create API** and set the Identifier to `https://student-api` (this is the audience).
3. Note your Domain and Client ID.

## 2. MongoDB Atlas

Create a free cluster, a database user, and copy the connection string.
Under Network Access, allow your IP (`0.0.0.0/0` is fine for learning).

## 3. Dropbox

Create an app at https://www.dropbox.com/developers/apps with the permissions
`files.content.write` and `sharing.write`. Generate a refresh token for the app.
(For a quick test you can use a generated access token in `server.js`:
`new Dropbox({ accessToken: '...' })`, but it expires in about 4 hours.)

## 4. Run the backend

```
cd backend
cp .env.example .env      # then fill in your values
npm install
npm start
```

## 5. Run the frontend

Open `frontend/src/app/config.ts` and fill in your Auth0 domain and client ID.

```
cd frontend
npm install
npm start
```

Open http://localhost:4200

## 6. Deploy

**Backend (Render):** push `backend` to GitHub, create a Web Service with start command
`node server.js`, and add the `.env` values as environment variables.

**Frontend (Firebase):**

```
cd frontend
npm i -g firebase-tools
firebase login
firebase init hosting     # public dir: dist/student-app/browser, single-page app: Yes,
                          # do NOT overwrite firebase.json / index.html if asked
```

Set `apiUrl` in `config.ts` to your Render URL, then:

```
npm run build
firebase deploy
```

Finally add your `https://xxxx.web.app` URL to the Auth0 callback, logout and web origins lists.

## Troubleshooting

- 401 error: check `AUTH0_DOMAIN` / `AUTH0_AUDIENCE` in the backend and `auth0Audience` in `config.ts`.
- CORS error: make sure `apiUrl` matches the backend URL.
