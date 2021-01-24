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

### Create `.env.local` file

```bash
FIREBASE_PROJECT_ID=<projectId>
FIREBASE_CLIENT_EMAIL=<clientEmail>
FIREBASE_PRIVATE_KEY=<privateKey>
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
