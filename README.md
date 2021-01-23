# 774-link

> WIP

## Build Setup

```bash
# install dependencies
yarn

# serve with hot reload at localhost:3000
yarn dev

# build for production and launch server
yarn build
yarn start

# generate static project
yarn export

# deploy to Firebase Hosting
yarn deploy
```

## Firebase Setup

### Create `.env` file

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=<apiKey>
NEXT_PUBLIC_FIREBASE_APP_ID=<appId>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<projectId>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<authDomain>
NEXT_PUBLIC_FIREBASE_DATABASE_URL=<databaseURL>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<storageBucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<measurementId>

```

### Functions Config

```bash
# import
firebase functions:config:set $(jq -r 'to_entries[] | [.key, (.value | tojson)] | join("=")' < .runtimeconfig.json)

# export
firebase functions:config:get > .runtimeconfig.json
```

### Deploy to Firebase

```bash
# functions (all functions)
firebase deploy --only functions
# functions (specified function)
firebase deploy --only functions:function1

# firestore (rules and indexes)
firebase deploy --only firestore
# firestore (rules)
firebase deploy --only firestore:rules
# firestore (indexes)
firebase deploy --only firestore:indexes

# hosting
firebase deploy --only hosting
```
