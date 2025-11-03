//# Survey Slate | Configuration


export const config = ({
  // All artifacts in the PUBLIC bucket are on the internet
  PUBLIC_BUCKET: "public-publicwrfxcsvqwpcgcrpx",
  // The private bucket requires credentials to access, should be for system wide things like user lists
  PRIVATE_BUCKET: "private-mjgvubdpwmdipjsn",
  // The confidential bucket is for customer data, it is encypted and access shoudl be minimized.
  CONFIDENTIAL_BUCKET: "confidential-bspqugxjstgxwjnt",
  // The URL to redirect users to when minting external credentials
  FILLER_APP_URL: "https://www.surveyslate.org/survey/index.html",
  // Default survey when minting credentials,
  DEFAULT_SURVEY: "gesi_survey",
  // Fill app staging environment for testing code changes
  FILLER_APP_STAGING_URL: "https://www.surveyslate.org/survey-staging/index.html",
  // Cloud Front distribution ID
  CLOUD_FRONT_DISTRIBUTION_ID: 'EG13QGKCG6LI9',
  // URL that hosts appplications
  CLOUD_FRONT_URL: 'https://www.surveyslate.org',
})



export const notebooks = ({
  configuration: "https://observablehq.com/@categorise/survey-slate-configuration",
  admin: "https://observablehq.com/@adb/gesi-survey-admin-tools",
  designer: "https://observablehq.com/@/gesi-survey-designer-tools",
  filler: "https://observablehq.com/@adb/gesi-survey-filler?collection=@adb/gesi-self-assessment",
  technical: "https://observablehq.com/@adb/gesi-survey-technical-overview?collection=@adb/gesi-self-assessment",
  manual: "https://observablehq.com/@adb/user-guide-for-gesi-survey-designer?collection=@adb/gesi-self-assessment",
  "gesi-components": "https://observablehq.com/@adb/gesi-survey-common-components?collection=@adb/gesi-self-assessment",
  "gesi-style": "https://observablehq.com/@adb/gesi-survey-styling?collection=@adb/gesi-self-assessment",
  "survey-slate-style": "https://observablehq.com/@categorise/survey-slate-styling",
  "survey-slate-components" : "https://observablehq.com/@categorise/survey-slate-common-components?collection=@adb/gesi-self-assessment",
  components: "https://observablehq.com/@adb/gesi-survey-components",
  component_designer_ui: "https://observablehq.com/@adb/gesi-survey-designer-ui",
  analysis: "https://observablehq.com/@adb/analysis-template?collection=@adb/gesi-self-assessment",
  credential: "https://observablehq.com/@adb/gesi-self-assessment-credentials?collection=@adb/gesi-self-assessment", 
})



export const links = ({
  public_bucket: "https://s3.console.aws.amazon.com/s3/buckets/public-publicwrfxcsvqwpcgcrpx?region=us-east-1",
  private_bucket: "https://s3.console.aws.amazon.com/s3/buckets/private-mjgvubdpwmdipjsn?region=us-east-1",
  confidential_bucket: "https://s3.console.aws.amazon.com/s3/buckets/confidential-bspqugxjstgxwjnt?region=us-east-1",
  iam_policy: "https://us-east-1.console.aws.amazon.com/iam/home#/policies/arn:aws:iam::032151534090:policy/user$jsonEditor",
  gesi_content: "https://docs.google.com/spreadsheets/d/1R9xJxF-Ry0SljqNfg9iiCcwRqDUU9hvc"
})



// These are not sensitive and don't matter if leak as they are just attached to test accounts
export const accounts = ({
  username_demo: "demoResponder",
  password_demo: "FnMcjZO1pn1uqmMh",
  username_test: "testUser",
  password_test: "Kp0YtJIgI6RuUWUo",
})

