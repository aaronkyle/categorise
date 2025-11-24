# Testing AWS Imports - Elaborated

https://github.com/observablehq/framework/discussions/2035

 Tom Larkworthy's [AWS Helpers](https://observablehq.com/@tomlarkworthy/aws) notebook


---


---

In the notebook context, we can use an import statement to pull over all the functions we need, and they work to pass our credentials into AWS.

For example, in https://observablehq.com/@categorise/surveyslate-designer-tools


```
import {listObjects, getObject, putObject, listUsers, createUser, deleteUser, getUser, listAccessKeys, createAccessKey, deleteAccessKey, viewof manualCredentials, viewof mfaCode, saveCreds, listUserTags, tagUser, untagUser, iam, s3, listGroups, listGroupsForUser, addUserToGroup, removeUserFromGroup} with {REGION as REGION} from '@tomlarkworthy/aws'
```

Assuming that we've done the work correctly of re-factoring Tom's notebook both as an Observable Framework page and as vanilla JS, the corresponding import statement would be:

```
import {listObjects, getObject, putObject, listUsers, createUser, deleteUser, getUser, listAccessKeys, createAccessKey, deleteAccessKey, manualCredentials, mfaCode, saveCreds, listUserTags, tagUser, untagUser, iam, s3, listGroups, listGroupsForUser, addUserToGroup, removeUserFromGroup} from '/components/aws.js';
```

Since we can't alias imports in Framework the same as we do in notebooks, we explicitly define the `with` statement:

```
with {REGION as REGION} 
``

-as this-

```js echo
const REGION = 'us-east-2'
```



--

Yet when attempting to import all the AWS functions we at one throws hit our first error, and the import statement doesn't resolve.

Right off the bat, we find an Observable-specific statement that works in the Framework notebook but that fails when trying to use it as standard JavaScript: `invalidation`.

```
  // viewof manualCredentials.addEventListener('input', check);
    manualCredentialsElement.addEventListener("input", check);
  invalidation.then(() => {
  // viewof manualCredentials.removeEventListener('input', check);
    manualCredentialsElement.removeEventListener("input", check);
  });
```

`invalidation` won't work in normal JS, as the runtime injects into _cells_ (external ES modules have so such concept).  As it doesn't look like I can get past this particular failure, I quickly tried to manually reconstruct  `manualCredentials` locally to prevent getting hung up when importing it. In doing this, I wanted to see if we can pass the credentials ion our other `aws.js` functions:


---

_Demo Credentials for Testing:_

```js
const accessKeyId = 'AKIAQO7DBPIFETPNCNEF'
```
```js
const secretAccessKey = 'rldqyLNCyckm31sF9tYRXmfIVXZeDwPZL6pXGvAa'
```

<pre><code>
{
  "accessKeyId": "${accessKeyId}",
  "secretAccessKey": "${secretAccessKey}"
}
</code></pre>

---


```js
const manualCredentialsElement = (() => {
  const existingCreds = localStorage.getItem(
    `AWS_CREDS_${btoa(htl.html`<a href>`.href.split("?")[0])}`
  );

  const control = Inputs.textarea({
    label: "Supply AWS credentials as JSON",
    rows: 6,
    minlength: 1,
    submit: true,
    value: existingCreds
  });

  // Just wrap and return
  const wrapper = htl.html`<div class="pmnuxzjxzr">
    <style>
      .pmnuxzjxzr > form > div > textarea {
        ${
          existingCreds
            ? `
              color: transparent;
              text-shadow: 0 0 4px rgba(0,0,0,0.5);
            `
            : ""
        }
      }
    </style>
    ${control}
  </div>`;

  // Forward value accessors
  Object.defineProperty(wrapper, "value", {
    get: () => control.value,
    set: v => (control.value = v)
  });

  // Forward events so Generators.input() can listen
  control.addEventListener("input", e =>
    wrapper.dispatchEvent(new Event("input"))
  );
  control.addEventListener("change", e =>
    wrapper.dispatchEvent(new Event("change"))
  );

  return wrapper;

})();
```
```js
const manualCredentials = Generators.input(manualCredentialsElement)
```


```js
display(manualCredentialsElement)
```
```js
display(manualCredentials)
```



```js
const saveCredsElement = htl.html`<span style="display: flex">${Inputs.button(
  "Save creds to local storage",
  {
    reduce: () =>
      localStorage.setItem(
        `AWS_CREDS_${btoa(htl.html`<a href>`.href.split("?")[0])}`,
        manualCredentialsElement.querySelector("textarea").value
      )
  }
)} ${Inputs.button("Clear stored creds", {
  reduce: () =>
    localStorage.removeItem(
      `AWS_CREDS_${btoa(htl.html`<a href>`.href.split("?")[0])}`
    )
})}</span>`
```
```js
const saveCreds = Generators.input(saveCredsElement)
```

```js echo
display(saveCredsElement);
```
```js echo
display(saveCreds);
```

---

... Nope. This doesn't take us far enough.  The `iam` constructor does not see the credentials being passed to it just yet.

---


```js echo
///!!!!
///RuntimeError: iam.getUser is not a function (see myTags)
///!!!
display(iam)
```

```js echo
///!!!!
///RuntimeError: iam.getUser is not a function (see myTags)
///!!!
display(await getUser())
```

---

We can take this a few steps further -- to see whether if we locally re-create the `iam`, `s3`, and `cloudFlare` configuration files these can play well with the other imported functions.

----

```js echo
const me = getUser()
display(await me)
```

```js echo
const myTags = listUserTags(me.UserName)
```


```js echo
const surveys = myTags['designer'].split(" ")
```

---

My goal is to spare having to redefine all the AWS functions (as below) Since my functions worked in the deployed Framework data application context, I was hoping that there is some trick that would allow me to export functions in so that the notebook could be used to wire up the credentialing.


---

```js echo
import {listObjects, getObject, putObject, listUsers, createUser, deleteUser, getUser, listAccessKeys, createAccessKey, deleteAccessKey, mfaCode, listUserTags, tagUser, untagUser, iam, s3, listGroups, listGroupsForUser, addUserToGroup, removeUserFromGroup} from '/components/aws.js';
```


```js echo
display(listObjects)
```

```js echo
display(getObject)
```
```js echo
display(putObject)
```
```js echo
display(listUsers)
```
```js echo
display(createUser)
```
```js echo
display(deleteUser)
```
```js echo
///!!!!
///RuntimeError: iam.getUser is not a function (see myTags)
///!!!
display(getUser)
```
```js echo
display(listAccessKeys)
```
```js echo
display(createAccessKey)
```

```js echo
display(deleteAccessKey)
```
```js echo
/// We don't want to keep invoking it as it jumps across the DOM. We can bind it.
///display(manualCredentialsElement)
```
```js echo
display(manualCredentials)
```
```js echo
display(mfaCode)
```
```js echo
display(saveCreds)
```
```js echo
display(saveCreds)
```
```js echo
display(listUserTags)
```
```js echo
display(tagUser)
```
```js echo
display(untagUser)
```
```js echo
display(iam)
```
```js echo
display(s3)
```
```js echo
display(listGroups)
```
```js echo
display(listGroupsForUser)
```
```js echo
display(addUserToGroup)
```
```js echo
display(removeUserFromGroup)
```

