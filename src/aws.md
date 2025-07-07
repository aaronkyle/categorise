```js
md`# AWS Helpers
`
```

```js
md`

Store AWS credentials in local storage and call the AWS SDK. So far we have added IAM, S3 and CloudFront. If you need more SDK methods, create an web SDK distribution using https://sdk.amazonaws.com/builder/js/ 

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

I am a big fan of using resource tagging to provide attribute based access control (ABAC), as an alternative to API Gateway. With IAM policies, you can add a tag to an s3 object, and a tag to a user account, and express that "only users with the matching tag can access the file". Using wildcards and StringLike expressions, you can tag a user account with all projects they can access, and let them create files only with a matching project prefix.

For example, the following AWS policy rule allows the authenticated IAM user (a.k.a. the Principle) to create a file with a "project" tag that matches one of the projects in their tag "projects" (space prefixed/suffixed/delimited) list.
~~~
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

With the right IAM User Group policies and this AWS SDK wrapper you can build a quite powerful multi-tenancy file storage system without API gateway. Kinda like a Firebase Storage-lite. Don't underestimate tagging! For more info check out Amazon's documentation. 

https://docs.aws.amazon.com/AmazonS3/latest/userguide/tagging-and-policies.html

`
```

```js
AWS = require(await FileAttachment("aws-sdk-2.983.0.min.js").url()).then(
  (_) => window["AWS"]
)
```

```js
md`# Credentials

A credentials file can be used to derive *access_tokens* for SDK calls.
~~~js
{ 
  "accessKeyId": <YOUR_ACCESS_KEY_ID>,
  "secretAccessKey": <YOUR_SECRET_ACCESS_KEY>
}
~~~
`
```

```js
md`## Input credentials

Not persisted or shared outside of your local network. Paste an unencrypted JSON of your credentials in the following box to authenticate.
`
```

```js
viewof manualCredentials = {
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
            : null
        }
      }
    </style>
    ${control}`;
  Inputs.bind(wrapped, control);
  return wrapped;
}
```

```js
saveCreds = htl.html`<span style="display: flex">${Inputs.button(
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

```js
md`## Credentials`
```

```js
credentials = Generators.observe(next => {
  const check = () => {
    const creds = viewof manualCredentials.value;
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

  viewof manualCredentials.addEventListener('input', check);
  invalidation.then(() => {
    viewof manualCredentials.removeEventListener('input', check);
  });
  check();
})
```

```js
md`Use creds in SDK`
```

```js
login = {
  AWS.config.credentials = credentials;
}
```

```js
md`# IAM`
```

```js
iam = login || new AWS.IAM()
```

```js
md`##### Users`
```

```js echo
listUsers = async () => {
  const response = await iam.listUsers().promise();
  return response.Users;
}
```

```js echo
createUser = async username => {
  const response = await iam
    .createUser({
      UserName: username
    })
    .promise();
  return response.User;
}
```

```js echo
deleteUser = async username => {
  const response = await iam
    .deleteUser({
      UserName: username
    })
    .promise();
}
```

```js echo
getUser = async username => {
  const response = await iam
    .getUser({
      ...(username && { UserName: username })
    })
    .promise();
  return response.User;
}
```

```js
md`##### Access Keys`
```

```js echo
listAccessKeys = async username => {
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
createAccessKey = async username => {
  const response = await iam
    .createAccessKey({
      UserName: username
    })
    .promise();
  return response.AccessKey;
}
```

```js echo
deleteAccessKey = async (username, accessKeyId) => {
  const response = await iam
    .deleteAccessKey({
      UserName: username,
      AccessKeyId: accessKeyId
    })
    .promise();
}
```

```js
md`##### User Tags`
```

```js echo
listUserTags = async username => {
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
tagUser = async (username, tagDictionary) => {
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
untagUser = async (username, keyArray) => {
  const response = await iam
    .untagUser({
      TagKeys: keyArray,
      UserName: username
    })
    .promise();
  return response.Tags;
}
```

```js
md`##### IAM User groups`
```

```js echo
listGroups = async username => {
  const response = await iam.listGroups().promise();
  return response.Groups;
}
```

```js echo
listGroupsForUser = async username => {
  const response = await iam
    .listGroupsForUser({
      UserName: username
    })
    .promise();
  return response.Groups;
}
```

```js echo
addUserToGroup = async (username, group) => {
  return await iam
    .addUserToGroup({
      UserName: username,
      GroupName: group
    })
    .promise();
}
```

```js echo
removeUserFromGroup = async (username, group) => {
  return await iam
    .removeUserFromGroup({
      UserName: username,
      GroupName: group
    })
    .promise();
}
```

```js
md`# S3

`
```

```js
md`S3 service doesn't work until you set a region, and you cannot create buckets through the SDK, you have to set them up in the console first, but you can add and remove files from a pre-existing bucket`
```

```js
REGION = 'us-east-2'
```

```js
s3 = login || new AWS.S3({ region: REGION })
```

```js
md`### CORS

AWS S3 SDK does not work until you enable a CORS policy in the bucket permissions

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
`
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
listObjects = async function (bucket, prefix = undefined, options = {}) {
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
getObject = async (bucket, path) => {
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
putObject = async (bucket, path, value, options) => {
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

```js echo
md`# CloudFront

`
```

```js echo
cloudFront = login || new AWS.CloudFront()
```

```js echo
createInvalidation = (distributionId, paths = []) => {
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

```js
md`---`
```

```js
import { expect } from '@tomlarkworthy/testing'
```

```js
import { randomId } from '@tomlarkworthy/randomid'
```

```js
import { resize } from '@endpointservices/resize'
```

```js
import { localStorage } from "@mbostock/safe-local-storage"
```

```js
import { signature } from '@mootari/signature'
```
