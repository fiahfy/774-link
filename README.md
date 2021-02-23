# 774-link

> Unofficial schedule site for 774 inc.

## Build Setup

```bash
# install dependencies
yarn

# serve with hot reload at localhost:3000
yarn dev
```

## Firebase Setup

### Create `.env.local` file

```bash
FIREBASE_PROJECT_ID=<projectId>
FIREBASE_CLIENT_EMAIL=<clientEmail>
FIREBASE_PRIVATE_KEY=<privateKey>
FIREBASE_STORAGE_BUCKET=<storageBucket>
```

### Export Configs

```bash
# function config
firebase functions:config:get > functions/.runtimeconfig.json

# firestore indexes
firebase firestore:indexes > firestore.indexes.json
```

### Import Configs

```bash
# function config
firebase functions:config:set $(jq -r 'to_entries[] | [.key, (.value | tojson)] | join("=")' < functions/.runtimeconfig.json)

# functions (all functions)
firebase deploy --only functions
# functions (specified function)
firebase deploy --only functions:function1

# firestore rules and indexes
firebase deploy --only firestore
# firestore rules
firebase deploy --only firestore:rules
# firestore indexes
firebase deploy --only firestore:indexes

# storage rules
firebase deploy --only storage
```
