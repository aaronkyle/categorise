//# AWS Helpers

/**
* This notebook ports a notebook by Tom Larkworthy (@tomlarkworthy):
* https://observablehq.com/@tomlarkworthy/aws
*
* All mistakes and deviations from the original are my own.
*/

//import { Runtime, Inspector } from "@observablehq/runtime";

import * as htl from "/components/htl@0.3.1.js";
import * as Inputs from "/components/inputs_observable.js";
import { Generators } from "observablehq:stdlib";


//const constAWS = import(await FileAttachment("aws-sdk-2.983.0.min.js").url()).then(
//  (_) => window["AWS"])
const AWS = await import("https://unpkg.com/aws-sdk@2.983.0/dist/aws-sdk.min.js").then(() => window.AWS)

//import * as expect from '/exports/testing/index.js'
import { expect } from '/components/testing.js';

//import { randomId } from '/exports/randomid.tgz'
//import { randomId } from '/exports/randomid/index.js'
//import * as randomId from '/exports/randomid/index.js'
import { randomId } from '/components/randomid.js';

//import { resize } from '/exports/resize.tgz'
//import { resize } from '/exports/resize/index.js';
//import * as resize from '/exports/resize/index.js';
import { resize } from '/components/resize.js';

//import { localStorage } from "/exports/safe-local-storage.tgz"
import { localStorage } from "/components/safe-local-storage.js";

//import { signature } from '/exports/signature.tgz'
//  import * as signature from '/exports/signature/index.js'
import { signature } from '/components/signature.js'



//# Credentials


//## Input credentials

export const manualCredentialsElement = (() => {
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
  return htl.html`<div class="pmnuxzjxzr">
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
})();

export const manualCredentials = Generators.input(manualCredentialsElement)


export const saveCredsElement = htl.html`<span style="display: flex">${Inputs.button(
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

export const saveCreds = Generators.input(saveCredsElement)



//## Credentials


// --- Credentials wiring (replaces Generators.observe + invalidation) ---

export let credentials = null;        // last valid parsed creds
export let mfaCode = "";              // exported for compatibility with your import line

// Apply parsed credentials to AWS.config and refresh service clients
function applyCredentials(parsed) {
  // Support either {accessKeyId, secretAccessKey, sessionToken?}
  const { accessKeyId, secretAccessKey, sessionToken, region } = parsed || {};

  // Basic validation
  if (!accessKeyId || !secretAccessKey) return;

  AWS.config.update({
    accessKeyId,
    secretAccessKey,
    ...(sessionToken ? { sessionToken } : {})
  });

  // Keep a default region but allow override via JSON if provided
  if (region) AWS.config.update({ region });

  credentials = parsed;

  // Recreate clients so they pick up any changed config immediately
  iam = new AWS.IAM();
  s3  = new AWS.S3({ region: AWS.config.region || REGION });
  cloudFront = new AWS.CloudFront();
}

// Parse textarea -> apply to AWS on load and on every input event
function checkAndApply() {
  const raw = manualCredentialsElement.value ?? manualCredentials; // either value path
  try {
    expect(raw).toBeDefined();
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveProperty("accessKeyId");
    expect(parsed).toHaveProperty("secretAccessKey");
    applyCredentials(parsed);
  } catch {
    // silently ignore until valid JSON with required keys
  }
}

// listen for changes
manualCredentialsElement.addEventListener("input", checkAndApply);
// initial apply
checkAndApply();

// --- Services & Helpers ---

// Default region for S3 if user doesn't supply one in creds JSON
export const REGION = "us-east-2";

// NOTE: use 'let' so we can refresh instances when credentials/region change
export let iam = new AWS.IAM();
export let s3  = new AWS.S3({ region: AWS.config.region || REGION });
export let cloudFront = new AWS.CloudFront();


//# IAM


//export const iam = login || new AWS.IAM()


//##### Users



export const listUsers = async () => {
  const response = await iam.listUsers().promise();
  return response.Users;
}



export const createUser = async username => {
  const response = await iam
    .createUser({
      UserName: username
    })
    .promise();
  return response.User;
}



export const deleteUser = async username => {
  const response = await iam
    .deleteUser({
      UserName: username
    })
    .promise();
}



export const getUser = async username => {
  const response = await iam
    .getUser({
      ...(username && { UserName: username })
    })
    .promise();
  return response.User;
}


//##### Access Keys


export const listAccessKeys = async username => {
  const response = await iam
    .listAccessKeys({
      UserName: username
    })
    .promise();
  return response.AccessKeyMetadata;
}



/*https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#createAccessKey-property*/
export const createAccessKey = async username => {
  const response = await iam
    .createAccessKey({
      UserName: username
    })
    .promise();
  return response.AccessKey;
}



export const deleteAccessKey = async (username, accessKeyId) => {
  const response = await iam
    .deleteAccessKey({
      UserName: username,
      AccessKeyId: accessKeyId
    })
    .promise();
}


//##### User Tags


export const listUserTags = async username => {
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



// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/IAM.html#tagUser-property
export const tagUser = async (username, tagDictionary) => {
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



export const untagUser = async (username, keyArray) => {
  const response = await iam
    .untagUser({
      TagKeys: keyArray,
      UserName: username
    })
    .promise();
  return response.Tags;
}


//##### IAM User groups


export const listGroups = async username => {
  const response = await iam.listGroups().promise();
  return response.Groups;
}



export const listGroupsForUser = async username => {
  const response = await iam
    .listGroupsForUser({
      UserName: username
    })
    .promise();
  return response.Groups;
}



export const addUserToGroup = async (username, group) => {
  return await iam
    .addUserToGroup({
      UserName: username,
      GroupName: group
    })
    .promise();
}



export const removeUserFromGroup = async (username, group) => {
  return await iam
    .removeUserFromGroup({
      UserName: username,
      GroupName: group
    })
    .promise();
}


//# S3


//export const REGION = 'us-east-2'

//export const s3 = login || new AWS.S3({ region: REGION })


//### CORS


export async function hasBucket(name) {
  return s3
    .getBucketLocation({
      Bucket: name
    })
    .promise()
    .then(() => true)
    .catch(err => false);
}



export const listObjects = async function (bucket, prefix = undefined, options = {}) {
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



export const getObject = async (bucket, path) => {
  const response = await s3
    .getObject({
      Bucket: bucket,
      Key: path
    })
    .promise();
  return response.Body;
}



export const putObject = async (bucket, path, value, options) => {
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


//# CloudFront




// export const cloudFront = login || new AWS.CloudFront()



export const createInvalidation = (distributionId, paths = []) => {
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




