# Endpoint Services: Login with Comment

This auth server creates tokens signed for use with endpointservices Firebase account. 

We wish to enable creator A to fork and programatically access their data. But we need to ensure that creator A's services cannot be access by creator B (isolation). 

One method is to provide access controls, which is what @endpointservices does. Thus, creator A or creator B can login from an endpointservices domain, and isolation is enforced through logic. No creators can tamper with @endpointservice's notebooks. 

However, we also want userA to configure their own services programatically. So they need access from their forked namespace. We cannot gaurantee that sufficient access controls will be in place for third party namespaces, so we only issue Creator A tokens when on namespace @CreatorA.

This auth logic is encoded in the AUTH_CHECK


```js echo
import {
  createLogin,
  verify_backend,
  prepare_backend,
  userFirebase as firebase,
  verifyIdToken,
  subdomain
} with {
  firebaseConfig as TOKEN_FIREBASE_CONFIG,
  TOKEN_SIGNER_SERVICE_ACCOUNT_SECRET,
  HOST_NOTEBOOK,
  AUTH_CHECK
} from "@endpointservices/login-with-comment"
```

```js
const user = view(createLogin())
```

```js echo
user.getIdToken()
```

```js echo
md`~~~
${JSON.stringify(
  await verifyIdToken(firebase, await user.getIdToken()),
  null,
  2
)}
~~~`
```

```js echo
const AUTH_CHECK = ({ login, namespace } = {}) => {
  // Anybody can sign into the trusted domains
  if (namespace == "endpointservices" || namespace == "tomlarkworthy") {
    return true;
  } else {
    // A user foo can signing from namspace foo, as they own their own data
    if (namespace == login) return true;
    else {
      throw new Error(
        `${login} cannot login to endpoint services from ${namespace}, fork into your own namespace first`
      );
    }
  }
}
```

```js
verify_backend
```

```js
prepare_backend
```

```js
const HOST_NOTEBOOK = '@endpointservices/endpoint-login-with-comment'
```

```js
const TOKEN_SIGNER_SERVICE_ACCOUNT_SECRET = 'endpointservices_secretadmin_service_account_key'
```

```js
const firebaseConfig = ({
  apiKey: "AIzaSyD882c8YEgeYpNkX01fhpUDfioWl_ETQyQ",
  authDomain: "endpointservice.firebaseapp.com",
  projectId: "endpointservice",
  databaseURL: "https://endpointservice-eu.europe-west1.firebasedatabase.app/"
})
```

```js
//import { footer } from "@endpointservices/endpoint-services-footer"
```

```js
//footer
```
