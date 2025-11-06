# AWS Helpers

This notebook ports a notebook by <a href="https://observablehq.com/@mbostock">Tom Larkworthy @tomlarkworthy</a> called <a href="https://observablehq.com/@tomlarkworthy/aws">AWS</a>.
All mistakes and deviations from the original are my own.</div>

---

Store AWS credentials in local storage and call the AWS SDK. So far we have added IAM, S3 and CloudFront. If you need more SDK methods, create an web SDK distribution using https://sdk.amazonaws.com/builder/js/ 

```
~~~js
  import {
    iam, s3,
    viewof manualCredentials, saveCreds.
    listObjects, getObject, putObject,
    listGroups, listGroupsForUser, addUserToGroup, removeUserFromGroup
    listUsers, createUser, deleteUser, getUser,
    listAccessKeys, createAccessKey, deleteAccessKey,
    listUserTags, tagUser, untagUser
  } with {REGION as REGION} from '@tomlarkworthy/aws'
~~~
```

I am a big fan of using resource tagging to provide attribute based access control (ABAC), as an alternative to API Gateway. With IAM policies, you can add a tag to an s3 object, and a tag to a user account, and express that "only users with the matching tag can access the file". Using wildcards and StringLike expressions, you can tag a user account with all projects they can access, and let them create files only with a matching project prefix.

For example, the following AWS policy rule allows the authenticated IAM user (a.k.a. the Principle) to create a file with a "project" tag that matches one of the projects in their tag "projects" (space prefixed/suffixed/delimited) list.

```
~~~js
{
    "Effect": "Allow",
    "Action": [
        "s3:putObjectTagging"
        "s3:PutObject"
    ],
    "Resource": "arn:aws:s3:::myBucket/*",
    "Condition": {
        "StringLike": {
            "aws:PrincipalTag/projects": "* \${s3:RequestObjectTag/project} *"
        }
    }
}
~~~
```

With the right IAM User Group policies and this AWS SDK wrapper you can build a quite powerful multi-tenancy file storage system without API gateway. Kinda like a Firebase Storage-lite. Don't underestimate tagging! For more info check out Amazon's documentation. 

https://docs.aws.amazon.com/AmazonS3/latest/userguide/tagging-and-policies.html


```js echo
//const constAWS = import(await FileAttachment("aws-sdk-2.983.0.min.js").url()).then(
//  (_) => window["AWS"])
const AWS = await import("https://unpkg.com/aws-sdk@2.983.0/dist/aws-sdk.min.js").then(() => window.AWS);
display(AWS)
```

# Credentials

A credentials file can be used to derive *access_tokens* for SDK calls.

    ```
    ~~~js
    { 
      "accessKeyId": <YOUR_ACCESS_KEY_ID>,
      "secretAccessKey": <YOUR_SECRET_ACCESS_KEY>
    }
    ~~~
    ```


## Input credentials

Not persisted or shared outside of your local network. Paste an unencrypted JSON of your credentials in the following box to authenticate.


```js echo
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

```js echo
const manualCredentials = Generators.input(manualCredentialsElement)
```

```js echo
display(manualCredentialsElement);
```


```js echo
display(manualCredentials)
```




```js echo
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


```js
display(saveCredsElement);
```


```js
display(saveCreds);
```

## Credentials



```js echo
const credentials = Generators.observe((next) => {
  const check = () => {
    //const creds = viewof manualCredentials.value;
    //const creds = manualCredentialsElement.value;
    const creds = manualCredentials;
    try {
      expect(creds).toBeDefined();
      const parsed = JSON.parse(creds);
      expect(parsed).toHaveProperty("accessKeyId");
      expect(parsed).toHaveProperty("secretAccessKey");
      next(parsed);
    } catch (err) {
      //next(err);
    }
  };

  // viewof manualCredentials.addEventListener('input', check);
    manualCredentialsElement.addEventListener("input", check);
  invalidation.then(() => {
  // viewof manualCredentials.removeEventListener('input', check);
    manualCredentialsElement.removeEventListener("input", check);
  });

  check();
});
display(credentials)
```

```js echo
display(credentials)
```


```js echo
display(await credentials)
```

Use creds in SDK

```js echo
const login = (() => {
  AWS.config.credentials = credentials;
})();
display(login)
```

# IAM

```js echo
const iam = login || new AWS.IAM();
display(iam)
```

##### Users


```js echo
const listUsers = async () => {
  const response = await iam.listUsers().promise();
  return response.Users;
};
display(listUsers)
```

```js echo
const createUser = async username => {
  const response = await iam
    .createUser({
      UserName: username
    })
    .promise();
  return response.User;
};
display(createUser)
```

```js echo
const deleteUser = async username => {
  const response = await iam
    .deleteUser({
      UserName: username
    })
    .promise();
};
display(deleteUser)
```

```js echo
const getUser = async username => {
  const response = await iam
    .getUser({
      ...(username && { UserName: username })
    })
    .promise();
  return response.User;
}
display(getUser)
```

##### Access Keys

```js echo
const listAccessKeys = async username => {
  const response = await iam
    .listAccessKeys({
      UserName: username
    })
    .promise();
  return response.AccessKeyMetadata;
};
display(listAccessKeys)
```

```js echo
/*https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#createAccessKey-property*/
const createAccessKey = async username => {
  const response = await iam
    .createAccessKey({
      UserName: username
    })
    .promise();
  return response.AccessKey;
};
display(createAccessKey)
```

```js echo
const deleteAccessKey = async (username, accessKeyId) => {
  const response = await iam
    .deleteAccessKey({
      UserName: username,
      AccessKeyId: accessKeyId
    })
    .promise();
};
display(deleteAccessKey)
```

##### User Tags

```js echo
const listUserTags = async username => {
  const response = await iam
    .listUserTags({
      UserName: username
    })
    .promise();
  return response.Tags.reduce(
    (acc, r) =>
      Object.defineProperty(acc, r.Key, { value: r.Value, enumerable: true }),
    {}
  );
};
display(listUserTags)
```

```js echo
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#tagUser-property
const tagUser = async (username, tagDictionary) => {
  const response = await iam
    .tagUser({
      Tags: Object.entries(tagDictionary).map(e => ({
        Key: e[0],
        Value: e[1]
      })),
      UserName: username
    })
    .promise();
  return response.Tags;
};
display(tagUser)
```

```js echo
const untagUser = async (username, keyArray) => {
  const response = await iam
    .untagUser({
      TagKeys: keyArray,
      UserName: username
    })
    .promise();
  return response.Tags;
};
display(untagUser)
```

##### IAM User groups

```js echo
const listGroups = async username => {
  const response = await iam.listGroups().promise();
  return response.Groups;
};
display(listGroups)
```

```js echo
const listGroupsForUser = async username => {
  const response = await iam
    .listGroupsForUser({
      UserName: username
    })
    .promise();
  return response.Groups;
};
display(listGroupsForUser)
```

```js echo
const addUserToGroup = async (username, group) => {
  return await iam
    .addUserToGroup({
      UserName: username,
      GroupName: group
    })
    .promise();
};
display(addUserToGroup)
```

```js echo
const removeUserFromGroup = async (username, group) => {
  return await iam
    .removeUserFromGroup({
      UserName: username,
      GroupName: group
    })
    .promise();
};
display(removeUserFromGroup)
```

# S3


S3 service doesn't work until you set a region, and you cannot create buckets through the SDK, you have to set them up in the console first, but you can add and remove files from a pre-existing bucket

```js echo
const REGION = 'us-east-2';
display(REGION)
```

```js echo
const s3 = login || new AWS.S3({ region: REGION });
display(s3)
```

### CORS

AWS S3 SDK does not work until you enable a CORS policy in the bucket permissions

    ```
    ~~~js
    [
        {
            "AllowedHeaders": [
                "*"
            ],
            "AllowedMethods": [
                "PUT",
                "GET",
                "HEAD"
            ],
            "AllowedOrigins": [
                "*"
            ],
            "ExposeHeaders": [],
            "MaxAgeSeconds": 3000
        }
    ]
    ~~~
    ```

```js echo
async function hasBucket(name) {
  return s3
    .getBucketLocation({
      Bucket: name
    })
    .promise()
    .then(() => true)
    .catch(err => false);
};
display(hasBucket)
```

```js echo
const listObjects = async function (bucket, prefix = undefined, options = {}) {
  const response = await s3
    .listObjectsV2({
      Bucket: bucket,
      Delimiter: "/",
      ...(prefix && { Prefix: prefix }),
      ...options
    })
    .promise();
  return response.CommonPrefixes;
};
display(listObjects)
```

```js echo
const getObject = async (bucket, path) => {
  const response = await s3
    .getObject({
      Bucket: bucket,
      Key: path
    })
    .promise();
  return response.Body;
};
display(getObject)
```

```js echo
const putObject = async (bucket, path, value, options) => {
  const s3Options = { ...options };
  delete s3Options["tags"];
  return s3
    .putObject({
      Bucket: bucket,
      Key: path,
      Body: value,
      ...(options?.tags && {
        Tagging: Object.entries(options.tags)
          .map((e) => `${e[0]}=${e[1]}`)
          .join("&")
      }),
      ...s3Options
    })
    .promise();
};
display(putObject)
```

# CloudFront



```js echo
const cloudFront = login || new AWS.CloudFront()
```

```js echo
const createInvalidation = (distributionId, paths = []) => {
  const operationId = randomId(16);
  return cloudFront
    .createInvalidation({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: operationId,
        Paths: {
          Quantity: paths.length,
          Items: paths
        }
      }
    })
    .promise();
};
display(createInvalidation)
```

---


```js echo
//import * as expect from '/exports/testing/index.js'
import { expect } from '/components/testing.js';
display(expect)
```

```js echo
//import { randomId } from '/exports/randomid.tgz'
//import { randomId } from '/exports/randomid/index.js'
//import * as randomId from '/exports/randomid/index.js'
import { randomId } from '/components/randomid.js';
display(randomId)
```

```js echo
//import { resize } from '/exports/resize.tgz'
//import { resize } from '/exports/resize/index.js';
//import * as resize from '/exports/resize/index.js';
import { resize } from '/components/resize.js';
display(resize)
```

```js echo
//import { localStorage } from "/exports/safe-local-storage.tgz"
import { localStorage } from "/components/safe-local-storage.js";
display(localStorage)
```

```js echo
//import { signature } from '/exports/signature.tgz'
//  import * as signature from '/exports/signature/index.js'
import { signature } from '/components/signature.js'
display(signature)
```
