# AWS Cost Management Plugin by Economize

This plugin makes it easier to understand your cloud expenses in AWS. After the setup, this plugin gives you comprehensive reports of your cloud costs by breaking it down to various factors like timeframe, credits, components and anomaly detection.

## Setup AWS for Economize Plugin

This plugin requires the export of Cost Usage Reports of AWS. Cost Usage Reports contains the breakdown of cost and usage data by various metrics. To acquire and store the export of Cost Usage Reports we will be needing a S3 storage bucket and Amazon Athena pointed towards the S3 storage bucket to query the dataset.

Here is a guide on setting up CUR, S3 and Athena for Cost Usage Reports. [Click here](https://docs.aws.amazon.com/cur/latest/userguide/use-athena-cf.html)

### Getting Started

1. [Create User](https://console.aws.amazon.com/iam/home#/users$new?step=details)

2. Enter `User Name` And Check  `Access Key - Programmatic access`

![picture alt](https://ik.imagekit.io/economize/docs/backstage/image_m9EwMbg-0bw.png?ik-sdk-version=javascript-1.4.3&updatedAt=1642590624799)

3. Click on `Next: Permissions`

4. Go to `Attach existing policies directly`

![picture alt](https://ik.imagekit.io/economize/docs/backstage/image_mIB0LEaVuo5.png?ik-sdk-version=javascript-1.4.3&updatedAt=1642590737728)

5. Click on `Create Policy` > `JSON`

6. Replace `<TABLE> ,<DATABSE>, <WORKGROUP>, <REGION>, <ACCOUNT_ID>, <BUCKET_NAME>` with their respective value in the json down below.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "organizations:ListRoots",
        "organizations:DescribeOrganization",
        "ce:GetCostAndUsage"
      ],
      "Resource": "*"
    },
    {
      "Sid": "VisualEditor1",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "athena:StartQueryExecution",
        "s3:AbortMultipartUpload",
        "glue:GetPartitions",
        "athena:GetQueryExecution",
        "athena:GetQueryResults",
        "organizations:ListOrganizationalUnitsForParent",
        "s3:ListMultipartUploadParts",
        "glue:GetTable"
      ],
      "Resource": [
        "arn:aws:organizations::*:root/o-*/r-*",
        "arn:aws:organizations::*:ou/o-*/ou-*",
        "arn:aws:s3:::<BUCKET_NAME>/*",
        "arn:aws:glue:<REGION>:<ACCOUNT_ID>:catalog",
        "arn:aws:glue:<REGION>:<ACCOUNT_ID>:table/<DATABASE>/<TABLE>",
        "arn:aws:glue:<REGION>:<ACCOUNT_ID>:database/<DATABASE>",
        "arn:aws:athena:<REGION>:<ACCOUNT_ID>:workgroup/<ENTER WORKGROUP NAME>"
      ]
    },
    {
      "Sid": "VisualEditor2",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucketMultipartUploads",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::<BUCKET_NAME>"
    }
  ]
}
```

6. Click on `Next: Tags` > `Next: Review`

7. Enter `Policy Name` then, click on `Create Policy`

8. Get back to Tab and Refresh then Enter the `Policy Name`

9. Check the entered `Policy Name`

![picture alt](https://ik.imagekit.io/economize/docs/backstage/image_1__NvPfnmsGwzt.png?ik-sdk-version=javascript-1.4.3&updatedAt=1642591211432)

10. Click on `Next: Tags` > `Next: Review` > `Create User`

11. Download the CSV, required for the steps below.

## Installation

1. In the [packages/app](https://github.com/backstage/backstage/blob/master/packages/app/) directory of your backstage
   instance, add the plugin as a package.json dependency:

```shell
$ yarn add @economize/backstage-plugin
```

2. Import page to [App.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/App.tsx):

```tsx
import { EconomizePage } from '@economize/backstage-plugin';
```

3. And add a new route to [App.tsx](https://github.com/backstage/backstage/blob/master/packages/app/src/App.tsx):

```tsx
<Route path="/economize" element={<EconomizePage />} />
```

4. Update [app-config.yaml](https://github.com/backstage/backstage/blob/master/app-config.yaml) to add a new proxy
   config from the downloaded CSV file.

```yaml
economize:
  table: ''
  accessKeyId: ''
  secretAccessKey: ''
  region: ''
  Database: ''
  OutputLocation: ''
  WorkGroup: ''
```

5. Add Economize to your app Sidebar.

```tsx
+ import MoneyIcon from '@material-ui/icons/MonetizationOn';

+ <SidebarItem icon={MoneyIcon} to="economize" text="Economize" />


```
