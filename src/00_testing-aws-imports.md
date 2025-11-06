# 03 test 1


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

----

Demo Credentials for Testing:


        {
          "accessKeyId": "AKIAQO7DBPIFDAUBK4SL",
          "secretAccessKey": "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"
        }



---

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
display(getUser)
```

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

