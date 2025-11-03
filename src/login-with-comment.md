# Login with comment
<h2>⚠️ the V2 is <a href="https://observablehq.com/@endpointservices/login-with-comment-v2">here</a></h2>

The simplest way to securely discover the currently logged in user. Furthermore, the result generates a token you can externally verify for use in backend services.

To authenticate, the user just needs to write a code in a publically visible comment.

<img width=480px src="${await FileAttachment(
  "ezgif.com-gif-maker.webp"
).url()}"></img>

The returned payload is a Firebase Auth user, signed in using a [custom token](https://firebase.google.com/docs/auth/admin/create-custom-tokens). Thus, the login persists across browser sessions. The host Firebase project is *"endpointserviceusers"*. If you only need to know the logged in user id you can verify these tokens without special access to *"endpointserviceusers"*.

If you want to use the token to access **your own backend** Firebase functionality, you should fork this notebook and rebase onto your own Firebase projects (see CONFIG section). An example is done [here](https://observablehq.com/@endpointservices/endpoint-login-with-comment).

Overally this is like an Oauth client bit without any params to configure! This should work across all notebook domains.

Import with

        ~~~js
          import {viewof user, verifyIdToken} from '@endpointservices/login-with-comment'
        ~~~

Instanciate the login prompt with

        ~~~js
          viewof user
        ~~~

a minimal working example in a 3rd party notebook is [here](https://observablehq.com/@tdlgkjfhdljovtttqrzu/login-with-comment-example)


### Change Log

- 2022-07-24: Syncronize independant login states using authStateListener, so logout on one buttons propogates to all log-with-comments
- 2021-08-29: Scan for team mebership feature. Looks at profile URLs and adds to JWT's additionalClaims


## <span style="font: var(--mono_fonts); font-size: 30px;"><span style="color: var(--syntax_keyword)">viewof</span> user</span>

```js echo
const createLogin = () => {
  // When no-one is logged in we want don't want the cell to resolve, so we return a promise
  // We want that promise to be resolved next time we get a value
  let firstResolve;
  const updateResult = () => {
    const newValue = userFirebase.auth().currentUser;
    if (firstResolve) {
      firstResolve(newValue);
    }
    if (!newValue) {
      if (!firstResolve)
        userUi.value = new Promise((resolve) => (firstResolve = resolve));
      else userUi.value = undefined;
    } else {
      userUi.value = newValue;
    }
    userUi.dispatchEvent(
      new CustomEvent("input", {
        bubbles: true,
        detail: {
          user: userUi.value || null
        }
      })
    );
  };

  const userUi = html`<span>${viewroutine(async function* () {
    let response;
    let err = "";
    const actionWas = (action) => response && response.actions.includes(action);

    // On a new page refresh the currentUser is unkown and we have to listen to the auth state change to discover
    // the initial state. This article explains it well
    // https://medium.com/firebase-developers/why-is-my-currentuser-null-in-firebase-auth-4701791f74f0
    if (!mutable authStateKnown) {
      let ready = null;
      const isReady = new Promise((resolve) => (ready = resolve));
      userFirebase.auth().onAuthStateChanged(ready);
      await isReady;
      mutable authStateKnown = true;
    }
    await new Promise((r) => r()); // micro tick so userUi initializes

    while (true) {
      try {
        // update overall view state
        updateResult();

        if (!userFirebase.auth().currentUser) {
          const loginUi = screen({
            actions: ["login"]
          });

          // We need to see if someone logs in via a side channel
          const unsubscribe = userFirebase.auth().onAuthStateChanged((user) => {
            if (user)
              loginUi.dispatchEvent(new Event("input", { bubbles: true }));
          });
          response = yield* ask(loginUi);
          unsubscribe();
        } else {
          const logoutUi = screen({
            actions: ["logout"]
          });
          // We need to see if someone logout ivia a side channel
          const unsubscribe = userFirebase.auth().onAuthStateChanged((user) => {
            if (!user)
              logoutUi.dispatchEvent(new Event("input", { bubbles: true }));
          });
          response = yield* ask(logoutUi);
          unsubscribe();
        }

        if (actionWas("logout")) {
          console.log("Logging out");
          yield screen({
            info: md`Logging out...`
          });
          await userFirebase.auth().signOut();
        }

        if (actionWas("login")) {
          console.log("login");
          const privateCode = randomId(64);
          const publicCode = await hash(privateCode);

          yield screen({
            info: md`Preparing...`
          });

          await prepare(publicCode);

          let relmeauth = false;
          while (!userFirebase.auth().currentUser) {
            while (!actionWas("verify")) {
              console.log("prompt verify");
              response = yield* ask(
                screen({
                  info: md`1.  ${err}Add comment containing **${publicCode}** to this notebook using the cell burger menu to the left.
2.  Click login to complete login.

<img width=300px src="${await FileAttachment(
                    "ezgif.com-gif-maker.webp"
                  ).url()}"></img>

  \n⚠️ Logging in discloses your [Observable](https://observablehq.com/) username to the notebook author.
                          ${actionWas("copy") ? "\ncopied to clipboard" : ""}`,
                  actions: ["copy", "verify"],
                  toggles: [
                    {
                      code: "profile_relmeauth",
                      label: html`[optional] scan for teams?`,
                      value: relmeauth,
                      caption: html`<details class='e-info' style="display: inline-block;font-size: 14px;"><summary>how does scanning work?</summary>
      ${md`From your Observablehq profile URL we look for weblinks to team profile URLs, and if those profile URLs also weblink to your profile URL we consider you to have admin access for that team (see [relmeauth](https://observablehq.com/@endpointservices/auth#observable_features))`}
    </details>`
                    }
                  ]
                })
              );

              if (actionWas("copy")) {
                navigator.clipboard.writeText(
                  "public auth code: " + publicCode
                );
              }

              relmeauth = response.profile_relmeauth === true;
            }

            console.log("Relmeauth scan?", relmeauth);

            response = undefined;
            console.log("verify");
            yield screen({
              info: md`Checking...`
            });

            try {
              const verification = await verify({
                notebookURL: html`<a href=""/>`.href.split("?")[0],
                privateCode,
                relmeauth
              });
              if (verification.access_token) {
                await userFirebase
                  .auth()
                  .signInWithCustomToken(verification.access_token);
              } else {
                throw new Error("no token returned");
              }
            } catch (error) {
              err = `<mark>⚠️ ${error.message}</mark>\n\n`;
            }
          }
        }
      } catch (err) {
        yield* ask(
          screen({
            info: md`Uexpected error: ${err.message}`,
            actions: ["ok"]
          })
        );
      }
    }
  })}`;

  return userUi;
}
```

```js
const user = view(createLogin())
```


#### Security Features
- the published auth code is a hash of a private verification code => the auth code in isolation is not useful.
- auth code validity is bounded at 10 minutes

#### Current issues
- logout does not return to undefined state (Observablehq bug? see https://talk.observablehq.com/t/unresolving-a-viewof-after-it-has-resolved-once/5450), for now we return undefined


```js
/// NOTE: We'll have to define a setter function and watch for uses of Mutable
const authStateKnown = Mutable(false);
```

### <span style="font: var(--mono_fonts); font-size: 25px;">user</span>

The cell resolves to the *currentUser* or a promise if not logged in. See below for the value in action


```js echo
user
```

```js
md`Hi **${user.uid}** you have an id_token 

~~~ 
   ${await user.getIdToken()}
~~~

that you can decode with **'verifyIdToken'**, this token decoded is:

~~~
${JSON.stringify(
  await verifyIdToken(userFirebase, await user.getIdToken()),
  null,
  2
)}
~~~

`
```

## Team support

If the scan of team feature is checked, the verifier will look for cross-linked observablehq profile accounts stemming from the user's profile. 

For example, say we want @tomlarkworthy to administer @endpointservices, then

- https://observablehq.com/@tomlarkworthy?tab=profile should have a website link to https://observablehq.com/@endpointservices 
- https://observablehq.com/@endpointservices?tab=profile should have a weblink to https://observablehq.com/@tomlarkworthy

If this is the case then the "observablehq.com" section of the JWT will have "admin" entries for keys "tomlarkworthy" and "endpointservices" after "tomlarkworthy" logs in.

These claims can then be used to gate access in Firebase services, so team mebers will be able to configure common data. To check for membership

In a Firestore rules you can use something like:

~~~
    match /collection/{teamdoc} {
    	allow read: if request.auth.token['observablehq.com'][teamdoc] == 'admin';
    }
~~~

and then tomlarkworthy will be able to access both \`/collection/tomlarkworthy\` and \`/collection/endpointservices\` docs in Firestore.

In Firebase Realtime Database complex tokens are not supported so we encode the claims in a single string with each identity framed with "|". So you can check for membership like so:

~~~
  "$teamdoc": {
    ".read": "auth.token.observablehq_com.contains('|' + $teamdoc + '|')"
  }
~~~

(note the claim key is different too)


### Config


```js
md`Host notebook fixes the URL of the backend.`
```

```js
const HOST_NOTEBOOK = "@endpointservices/login-with-comment"
```

```js
const AUTH_CHECK = ({
  login, // Observable user id
  namespace // namespace being used
} = {}) => true
```

#### Infra Firebase

The infra Firebase hosts the login state on a Realtime Database (e.g. the the challenge codes)


```js
const SERVICE_ACCOUNT_SECRET = "endpointservices_secretadmin_service_account_key"
```

```js
const FIREBASE_CONFIG = ({
  databaseURL: "https://endpointservice-eu.europe-west1.firebasedatabase.app/",
  apiKey: "AIzaSyD882c8YEgeYpNkX01fhpUDfioWl_ETQyQ",
  authDomain: "endpointservice.firebaseapp.com",
  projectId: "endpointservice",
  appId: "1:1986724398:web:9b8bc33895b45dd2e095bf"
})
```

```js echo
import { firebase } with { FIREBASE_CONFIG as firebaseConfig } from "@tomlarkworthy/firebase"
```

#### User Firebase

The user Firebase hosts the Firebase Auth data, it can be the same as the infra Firebase.


```js echo
import { firebase as userFirebase } with { TOKEN_FIREBASE_CONFIG as firebaseConfig } from "@tomlarkworthy/firebase"
```

```js
const TOKEN_SIGNER_SERVICE_ACCOUNT_SECRET = "endpointservices_minter"
```

The token Firebase is used to verify tokens and must be in same project as TOKEN_SIGNER_SERVICE_ACCOUNT

```js
const TOKEN_FIREBASE_CONFIG = ({
  apiKey: "AIzaSyBquSsEgQnG_rHyasUA95xHN5INnvnh3gc",
  authDomain: "endpointserviceusers.firebaseapp.com",
  projectId: "endpointserviceusers",
  appId: "1:283622646315:web:baa488124636283783006e",
  databaseURL:
    "https://endpointserviceusers-default-rtdb.europe-west1.firebasedatabase.app/"
})
```

## Design

```js
const chatIcon = svg`<svg width="29px" height="23px" viewBox="0 0 29 23" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Serverless-cells" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="login-with-comment" transform="translate(-48.000000, -108.000000)" stroke="#FDF7E6" stroke-width="3">
            <g id="chat-icon" transform="translate(50.000000, 110.000000)">
                <path d="M23.6369696,18.3862833 L24,19 L24,19 L9.5,19 C4.25329488,19 6.42536064e-16,14.7467051 0,9.5 C-6.42536064e-16,4.25329488 4.25329488,9.63804095e-16 9.5,0 L14.2282774,0 C18.6551849,-8.13209705e-16 22.2439024,3.58871755 22.2439024,8.015625 L22.2439024,13.295045 C22.2439024,15.0862605 22.7250191,16.8445961 23.6369696,18.3862833 Z" id="Path-10"></path>
                <line x1="5.3" y1="6.5" x2="13.7" y2="6.5" id="Path-9"></line>
                <line x1="5.29545455" y1="12.5" x2="17.7045455" y2="12.5" id="Path-11"></line>
            </g>
        </g>
    </g>
</svg>`
```

```js
const copyIcon = svg`<svg width="18px" height="22px" viewBox="0 0 18 22" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Serverless-cells" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="login-with-comment" transform="translate(-299.000000, -107.000000)" stroke="#FDF7E6" stroke-width="2">
            <g id="copyIcon" transform="translate(300.000000, 108.000000)">
                <polygon id="Path-12" stroke-linejoin="round" points="0 17 0 3.4 3.54545455 0 13 0 13 17"></polygon>
                <polyline id="Path-14" stroke-linejoin="round" points="4 17 4 20 16 20 16 4 13 4"></polyline>
                <line x1="3" y1="13" x2="10" y2="13" id="Path-17"></line>
                <line x1="3" y1="4.5" x2="10" y2="4.5" id="Path-15"></line>
                <line x1="3" y1="9" x2="10" y2="9" id="Path-17"></line>
            </g>
        </g>
    </g>
</svg>`
```

```js echo
const colors = ({
  dark: "#4A44C4",
  dark_darker: "#3933A3", 
  dark_darkest: "#2B277C",
  
  light: "#FDF7E6",
  light_darker: "#FBF0D1",
  light_darkest: "#F9E8B8",
  
  alt_light: "#9DE2BF",
  alt_light_darker: "#75D6A5",
  alt_light_darkest: "#4ECB8B",
  
  alt_dark: "#E78AAE",
  alt_darker: "#DE5E90",
  alt_darkest: "#D53472",
})
```

```js
button({
  action: "login",
  label: "Comment signin",
  icon: chatIcon
})
```

```js
const copyExample = view(button({
  action: "copy",
  label: "Copy",
  icon: copyIcon
}))
```

```js
copyExample
```

```js
const button = ({
  action,
  label,
  icon
} = {}) => {
  const btn = html`<button class="a-btn">${icon ? html`<span class="icon">${icon.outerHTML}<span>`: ''}<span class="label">${label}<span></button>`
  btn.onclick = () => {
    btn.value = action;
    btn.dispatchEvent(new Event('input', {bubbles: true}))
  }
  return btn;
}
```

```js echo
const container = (inner) => {
  return view`<div class='es-frame'>${style()}${['...', inner()]}</div>`
}
```

```js echo
screen 
```

```js
const style = () => html`<style>
  .es-frame {
    font-size: 18px;
    font-family: arial, sans-serif;
    display: inline-block;
    border-radius: 14px;
    padding: 2px;
    border: solid;
    border-width: 4px;
    border-color: ${colors.dark};
    background-color: ${colors.light};
    box-shadow: 1px 2px 4px #0008;
  } 
  .e-btns {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: flex-start;
  }
  .a-btn {
    font-size: 18px;
    font-family: Arial, sans-serif;
    border: none;
    border-radius: 8px;
    color: ${colors.light};
    background-color: ${colors.dark};
    margin: 2px;
  }
  .a-btn:hover {
    color: ${colors.light_darker};
    background-color: ${colors.dark_darker};
  }
  .a-btn:active {
    color: ${colors.light_darkest};
    background-color: ${colors.dark_darkest};
  }

  .a-btn .icon {
    position: relative;
    top: 4px;
    display: inline-block;
    padding-left: 8px;
  }
  .a-btn .label {
    position: relative;
    display: inline-block;
    padding: 8px;
  }
  .e-info {
    color: #131415;
    padding-left: 4px;
  }
</style>`
```

```js echo
container(() => htl.html`<div style="width: 400px"> 
  <span class="e-btns">
    ${button({
      action: "login",
      label: "Comment signin",
      icon: chatIcon
    })}${button({
      action: "copy",
      label: "Copy",
      icon: copyIcon
    })}
  </span>
    
  <p class="e-info" style="font-size: 14px;">write a comment containing code <i>'dasdasdasdas'</i> in a comment<br>
  ⚠️ comment not found (try again?)</p>
</span>`)
```

```js echo
const content = ({
  labels: {
    copy: "Copy to clipboard",
    login: "Login with comment",
    logout: () =>
      `Logout <b>${userFirebase
        .auth()
        .currentUser.uid.replace("observablehq|", '')}</b>`,
    verify: "Login"
  },
  icons: {
    copy: copyIcon,
    login: chatIcon
  }
})
```

```js echo
expandContent = (val) => typeof val === 'function' ? val() : val;
```

```js echo
const testScreen = view(screen({
  info: "Please copy code",
  actions: ["login", "verify"],
  toggles: [
    {
      code: "profile_relmeauth",
      label: html`[optional] scan for teams?`,
      value: true,
      caption: html`<details class='e-info' style="display: inline-block;font-size: 14px;"><summary>how does scanning work?</summary>
    ${md`From your Observablehq profile URL we look for weblinks to team profile URLs, and if those profile URLs also weblink to your profile URL we consider you to have admin access for that team. (related [relmeauth](https://observablehq.com/@endpointservices/auth#observable_features))`}
  </details>`
    }
  ]
}))
```

```js echo
testScreen
```

```js echo
const screen = ({ info, actions = [], toggles = [] } = {}) =>
  container(
    () => view`<div> 
  <span class="e-btns">
    ${[
      "actions",
      actions.map(action =>
        button({
          action,
          label: expandContent(content.labels[action]),
          icon: content.icons[action]
        })
      )
    ]}
  </span>
${info ? html`<p class="e-info" style="font-size: 14px;">${info}</p>` : ''}
${[
  '...',
  Object.fromEntries(
    toggles.map(toggle => {
      return [
        toggle.code,
        view`<div>
      <div>${[
        '...',
        stopPropagation(
          Inputs.toggle({ label: toggle.label, value: toggle.value })
        )
      ]}</div>
      <div>${toggle.caption}</div>
    </div>`
      ];
    })
  )
]}
</span>`
  )
```

```js echo
const stopPropagation = _view => {
  _view.addEventListener('input', evt => {
    if (evt?.detail?.user === undefined) evt.stopPropagation();
  });
  return view`<span>${['...', _view]}`;
}
```

## Code

```js
const runTestsSelector = view(Inputs.toggle({
  label: "run tests?",
  value: window["@endpointservices/healthcheck"]
}))
```

```js
const testing = {
  if (!runTestsSelector) return invalidation;
  const [{ Runtime }, { default: define }] = await Promise.all([
    import(
      "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js"
    ),
    import(`https://api.observablehq.com/@tomlarkworthy/testing.js?v=3`)
  ]);
  const module = new Runtime().module(define);
  return Object.fromEntries(
    await Promise.all(
      ["expect", "createSuite"].map((n) => module.value(n).then((v) => [n, v]))
    )
  );
}
```

```js
const expect = testing.expect
```

```js
const suite = view(testing.createSuite())
```

### Sketch of operation

- ask: Login with comment?
- login: send PUBLIC 'comment code' to login API (backend records origin notebook and time)
- tell: "Please post code into notebook, and click verify"
- verify: verifies time, comment exists and mints token, user send private KEY
  - failure: time
  - failure: not published
  - so you need to retry
- verify success: show logged in (login name)
- ask: logout?

#### prepare

Client sends the server the public key, so the server can record the clients intent to initiate a comment login. Client keeps private key secret, so only it can obtain credentials later on.


```js
const prepare_backend = deploy("prepare", async (req, res, ctx) => {
  if (!req.query.code) return res.status(400).send("Code must be set");
  const code = req.query.code
  
  const service_access_token = await getAccessTokenFromServiceAccount(ctx.secrets[SERVICE_ACCOUNT_SECRET]);
  await signinWithAccessToken(firebase, service_access_token);
  
  await firebase.database().ref(`@endpointservices/login-with-comment/prepare/${code}`).set({
    t: {".sv": "timestamp"} // Timestamp of when issues
  });
  
  res.send("OK")
}, {
  hostNotebook: HOST_NOTEBOOK, 
  secrets: [SERVICE_ACCOUNT_SECRET]
})
```

```js echo
const prepare = async publicCode => {
  if (!publicCode) throw new Error("public code required");
  const response = await fetch(`${prepare_backend.href}?code=${publicCode}`);
  if (response.status !== 200)
    throw new Error(`Err ${response.status}, ${await response.text()}`);
  return await response.text();
}
```

```js echo
const prepareOK = suite.test("prepare returns 200", async () => {
  const code = randomId(16);
  expect(await prepare(code)).toBe("OK");
})
```

```js echo
const prepareCodeResuse = suite.test("prepare codes cannot be reused", async (done) => {
  try {
    const code = randomId(16);
    await prepare(code);
    await prepare(code);
  } catch (err) {
    done() // Test will only resolve it error thrown
  }
})
```

#### findLoginCommentingCode

Finds a username of a person commenting something containing a code on a given notebook URL


```js
import { getCommentsAndNamespace } from '@endpointservices/get-comments'
```

```js
const findLoginCommentingCode = async (notebookURL, code) => {
  const { comments, namespace } = await getCommentsAndNamespace(notebookURL);
  if (!comments) return {login: undefined, namespace};
  const comment = comments.find(comment => comment.content.includes(code));
  return { login: comment?.user?.login, namespace };
}
```

```js echo
html`<img width=300px src="${await FileAttachment(
  "ezgif.com-gif-maker.webp"
).url()}"></img>`
```

```js
const findLoginCommentingCodeTest = suite.test(
  "findLoginCommentingCode finds a login",
  async () => {
    expect(
      await findLoginCommentingCode(
        "https://observablehq.com/@endpointservices/get-comments",
        "I am leaving a com"
      )
    ).toEqual({ login: "tomlarkworthy", namespace: "endpointservices" });
  }
)
```

```js
const findLoginCommentingCodeTest2 = suite.test(
  "findLoginCommentingCode returns undefined for no find",
  async () => {
    expect(
      await findLoginCommentingCode(
        "https://observablehq.com/@endpointservices/get-comments",
        randomId()
      )
    ).toEqual({ login: undefined, namespace: "endpointservices" });
  }
)
```

#### verify

Veryify takes a **private key**, SHA256 it, then looks for it in the comments of a provided notebook URL, if found, signs a token that can be used to initiate a Firebase auth session.

Additionally, if *relmeauth* flag is set it also scanes the users profiles pages for backlinked team accounts.


```js
const verify_backend = deploy(
  "verify",
  async (req, res, ctx) => {
    try {
      if (!req.query.code) return res.status(400).send("Code must be set");
      if (!req.query.notebookURL)
        return res.status(400).send("notebookURL must be set");
      const notebookURL = checkIsURL(req.query.notebookURL, "notebookURL");
      const privateCode = req.query.code;
      const publicCode = await hash(privateCode);
      const relmeauth = req.query.relmeauth !== undefined;

      const service_access_token = await getAccessTokenFromServiceAccount(
        ctx.secrets[SERVICE_ACCOUNT_SECRET]
      );
      await signinWithAccessToken(firebase, service_access_token);

      const prepared = await firebase
        .database()
        .ref(`@endpointservices/login-with-comment/prepare/${publicCode}`)
        .once("value");

      if (prepared.val() === null)
        return res.status(400).send("No code prepared");
      const { t } = prepared.val();

      // Code must be exchanged within time window.
      if (
        new Date() - new Date(t) > 10 * 60 * 1000 ||
        new Date() - new Date(t) < 0
      ) {
        return res.status(400).send("code no longer valid");
      }
      // Now look for PUBLIC code in notebook.
      const { login, namespace } = await findLoginCommentingCode(
        notebookURL,
        publicCode
      );

      if (!namespace)
        res.status(404).send("Could not find notebook, have you published it?");

      if (!login)
        res.status(401).send("Comment code not found, try again in a moment?");

      try {
        if (
          !AUTH_CHECK({
            login,
            namespace
          })
        )
          throw new Error("Failed AUTH_CHECK");
      } catch (err) {
        return res.status(403).send(err.message);
      }

      // w00t we found the code and the user login. So we should sign a JWT
      const id = `observablehq|${login}`;
      // lets find other accounts the user has access to if relmeauth is enabled
      const additionalClaims = {};
      if (relmeauth) {
        const accounts = await findObservablehqAccounts(login);
        additionalClaims["observablehq.com"] = Object.fromEntries(
          accounts.map((a) => [a, "admin"])
        );
        additionalClaims["observablehq_com"] = "|" + accounts.join("|") + "|";
      } else {
        additionalClaims["observablehq.com"] = {
          [login]: "admin"
        };
        additionalClaims["observablehq_com"] = "|" + login + "|";
      }
      additionalClaims["realm"] = namespace;

      const token = await createCustomToken(
        JSON.parse(ctx.secrets[TOKEN_SIGNER_SERVICE_ACCOUNT_SECRET]),
        /* uid */ id,
        /* additionalClaims */ additionalClaims,
        /* additionalFields */ {
          scope: "observablehq.com",
          me: id,
          client_id: HOST_NOTEBOOK
        }
      );
      res.json({
        access_token: token
      });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },
  {
    modifiers: ["orchestrator"],
    hostNotebook: HOST_NOTEBOOK,
    secrets: [SERVICE_ACCOUNT_SECRET, TOKEN_SIGNER_SERVICE_ACCOUNT_SECRET]
  }
)
```

```js
const verify = async ({ notebookURL, privateCode, relmeauth = false } = {}) => {
  if (!privateCode) throw new Error("privateCode required");
  if (!notebookURL) throw new Error("notebookURL required");
  const response = await fetch(
    `${
      verify_backend.href
    }?code=${privateCode}&notebookURL=${encodeURIComponent(notebookURL)}${
      relmeauth ? '&relmeauth' : ''
    }`
  );
  if (response.status === 404)
    throw new Error(`Cannot find notebook... has it been shared?`);
  else if (response.status !== 200) throw new Error(`${await response.text()}`);
  return await response.json();
}
```

```js
async function findObservablehqAccounts(login) {
  // Returns and array of links, including the users self-profile
  // {
  //   profile: "https://observablehq.com/@endpointservices"
  //   provider: "observable"
  //   verified: false
  // }
  const me = `https://observablehq.com/@${login}`;
  const client_id =
    "https://webcode.run/observablehq.com/@endpointservices/login-with-comment";
  const state = randomId();
  const fetchLinks = await fetch(
    `https://webcode.run/observablehq.com/@endpointservices/auth;supported_providers.json?me=${me}&client_id=${client_id}&state=${state}`
  );
  if (fetchLinks.status !== 200)
    throw new Error(
      `Cannot fetch: supported_providers.json ${
        fetchLinks.status
      }: ${await fetchLinks.text()}`
    );
  const links = (await fetchLinks.json()).links;
  const candidateTeams = links.filter((link) => link.provider === "observable");

  const verifications = await promiseRecursive(
    candidateTeams.map(async (link) => {
      const linkResponse = await fetch(
        `https://webcode.run/observablehq.com/@endpointservices/auth;verify_link.json?me=${me}&client_id=${client_id}&state=${state}&profile=${link.profile}`
      );
      if (linkResponse.status !== 200)
        throw new Error(
          `verify_link Error ${
            linkResponse.status
          }: ${await linkResponse.text()}`
        );
      return await linkResponse.json();
    })
  );

  return verifications
    .filter((verification) => verification.verified)
    .map((link) => /^https:\/\/observablehq.com\/@(.*)$/.exec(link.profile)[1]);
}
```

```js echo
const teamScan = suite.test("team scan runs", async () => {
  expect(await findObservablehqAccounts("tomlarkworthy")).toContain(
    "tomlarkworthy"
  );
})
```

```js echo
const verifyWithoutPrepare = suite.test(
  "verify 401 when not prepared",
  async (done) => {
    try {
      await verify({
        notebookURL:
          "https://observablehq.com/@endpointservices/login-with-comment",
        privateCode: randomId()
      });
    } catch (err) {
      expect(err.message).toBe("No code prepared");
      done();
    }
  }
)
```

```js echo
const verifyWithoutComment = suite.test(
  "verify 401 for missing comment",
  async (done) => {
    const privateCode = randomId();
    const publicCode = await hash(privateCode);
    await prepare(publicCode);
    let result = null;
    try {
      result = await verify({
        notebookURL:
          "https://observablehq.com/@endpointservices/login-with-comment",
        privateCode: privateCode
      });
    } catch (err) {
      expect(err.message).toBe(
        "Comment code not found, try again in a moment?"
      );
      done();
    }
    throw new Error(result);
  }
)
```

```js
async function hash(str) {
  // Similar to b64S256 but smaller and double click only copyable characters
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer =  await crypto.subtle.digest("SHA-256", data);
  const b64 = btoa(String.fromCharCode.apply(null, new Uint8Array(hashBuffer))).split('=')[0];
  return b64.replaceAll('+', /*difference*/ '_').replaceAll('/', '_').substring(0, 20)
}
```

```js echo
function checkIsURL(arg, name) {
  try {
    return new URL(arg).toString()
  } catch (err) {
    throw new Error(`${name || 'arg'} is not a URL`)
  } 
}
```

```js
import {view, cautious} from '@tomlarkworthy/view'
```

```js
import {viewroutine, ask} from '@tomlarkworthy/viewroutine'
```

```js
import {
  deploy,
  subdomain,
  getContext
} from "@endpointservices/serverless-cells"
```

```js
import { randomId } from '@tomlarkworthy/secure-random-id@65'
```

```js
import {
  createCustomToken,
  verifyCustomToken,
  verifyIdToken,
  signinWithAccessToken,
  getAccessTokenFromServiceAccount
} from "@tomlarkworthy/firebase-admin"
```

```js
//import { promiseRecursive } from '@tomlarkworthy/utils'
import { promiseRecursive } from '/components/utils.js'
```

```js
//import { footer } from "@endpointservices/endpoint-services-footer"
```

```js
//footer
```
