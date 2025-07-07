# AWS Helpers

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

const AWS = import("https://unpkg.com/aws-sdk@2.983.0/dist/aws-sdk.min.js").then(() => window.AWS)

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
const manualCredentials = () => view(() => {
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

  const wrapped = htl.html`<div class="pmnuxzjxzr">
    <style>
      .pmnuxzjxzr > form > div > textarea {
        ${
          existingCreds
            ? `
              color: transparent;
              text-shadow: 0 0 4px rgba(0,0,0,0.5);
            `
            : ''
        }
      }
    </style>
    ${control}`;

  Inputs.bind(wrapped, control);
  return wrapped;
});
```

```js echo
const saveCreds = htl.html`<span style="display: flex">${Inputs.button(
  "Save creds to local storage",
  {
    reduce: () =>
      localStorage.setItem(
        `AWS_CREDS_${btoa(htl.html`<a href>`.href.split("?")[0])}`,
        manualCredentials
      )
  }
)} ${Inputs.button("Clear stored creds", {
  reduce: () =>
    localStorage.removeItem(
      `AWS_CREDS_${btoa(htl.html`<a href>`.href.split("?")[0])}`
    )
})}</span>`
```

## Credentials


```js echo
const credentials = Generators.observe((next) => {
  const check = () => {
    const creds = manualCredentials.value; // ✅ Corrected this line
    try {
      expect(creds).toBeDefined();
      const parsed = JSON.parse(creds);
      expect(parsed).toHaveProperty("accessKeyId");
      expect(parsed).toHaveProperty("secretAccessKey");
      next(parsed);
    } catch (err) {
      // Credentials invalid or missing
    }
  };

  manualCredentials.addEventListener("input", check); // ✅ Also removed `viewof`
  invalidation.then(() => {
    manualCredentials.removeEventListener("input", check);
  });

  check(); // Run once immediately
});

```

Use creds in SDK`

```js echo
const login = () => {
  AWS.config.credentials = credentials;
}
```

# IAM

```js
const iam = login || new AWS.IAM()
```

##### Users


```js echo
const listUsers = async () => {
  const response = await iam.listUsers().promise();
  return response.Users;
}
```

```js echo
const createUser = async username => {
  const response = await iam
    .createUser({
      UserName: username
    })
    .promise();
  return response.User;
}
```

```js echo
const deleteUser = async username => {
  const response = await iam
    .deleteUser({
      UserName: username
    })
    .promise();
}
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
}
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
}
```

```js echo
const deleteAccessKey = async (username, accessKeyId) => {
  const response = await iam
    .deleteAccessKey({
      UserName: username,
      AccessKeyId: accessKeyId
    })
    .promise();
}
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
}
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
}
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
}
```

##### IAM User groups`

```js echo
const listGroups = async username => {
  const response = await iam.listGroups().promise();
  return response.Groups;
}
```

```js echo
const listGroupsForUser = async username => {
  const response = await iam
    .listGroupsForUser({
      UserName: username
    })
    .promise();
  return response.Groups;
}
```

```js echo
const addUserToGroup = async (username, group) => {
  return await iam
    .addUserToGroup({
      UserName: username,
      GroupName: group
    })
    .promise();
}
```

```js echo
const removeUserFromGroup = async (username, group) => {
  return await iam
    .removeUserFromGroup({
      UserName: username,
      GroupName: group
    })
    .promise();
}
```

# S3



S3 service doesn't work until you set a region, and you cannot create buckets through the SDK, you have to set them up in the console first, but you can add and remove files from a pre-existing bucket

```js
const REGION = 'us-east-2'
```

```js
const s3 = login || new AWS.S3({ region: REGION })
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
}
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
}
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
}
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
}
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
}
```

---


```js
import { expect } from '/exports/testing/index.js'
```

```js
import { randomId } from '/exports/randomid.tgz'
```

```js
import { resize } from '/exports/resize.tgz'
```

```js
import { localStorage } from "/exports/safe-local-storage.tgz"
```

```js
import { signature } from '/exports/signature.tgz'
```



```
EXPERIMENTAL:
//You must include untar-js in your project (npm install untar-js).
import untar from "untar-js";
import { FileAttachment } from "observablehq:std";

export async function loadTgzModule(attachmentName, entryMatch = /index\.js$/) {
  const buf = await FileAttachment(attachmentName).arrayBuffer();
  const files = await untar(new Uint8Array(buf));

  const entry = files.find(f => entryMatch.test(f.name));
  if (!entry) throw new Error(`Entry file not found in ${attachmentName}`);

  const jsCode = new TextDecoder().decode(entry.buffer);
  const blob = new Blob([jsCode], { type: "application/javascript" });
  const objectURL = URL.createObjectURL(blob);

  try {
    return await import(objectURL);
  } finally {
    URL.revokeObjectURL(objectURL);
  }
}
```


```
export const testing = await loadTgzModule("testing.tgz");
export const randomid = await loadTgzModule("randomid.tgz");
export const resize = await loadTgzModule("resize.tgz");
export const safeLocalStorage = await loadTgzModule("safe-local-storage.tgz");
export const signature = await loadTgzModule("signature.tgz");
```

```
USAGE
testing.expect(...);
randomid.randomId();
resize.resize(...);
safeLocalStorage.localStorage.setItem(...);
signature.signature(...);
```