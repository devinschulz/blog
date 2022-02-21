---
title: Building a Likes API With Google Cloud Functions
date: 2018-11-05T21:41:18-04:00
description:
  Learn how to use Google Cloud Functions to build a likes API with Node
tags: [Node, Google Cloud, Firebase, Serverless]
---

I took the challenge to build a likes button into this blog. Since the site is
compiled and then deployed as flat files, there is no backend or database to
manage. From a security aspect, there is no safer way to develop a website, but
it does add a bit of complexity to incorporate dynamic content.

My first attempt was to add Firebase as a dependency and wire it up to the likes
button. This worked great as it gave me real-time updates across multiple
browser sessions whenever I clicked the button. However, looking at the
compiled, minified bundle, I noticed it had added over 220 KB!

<!--more-->

{{< toc >}}

With that in mind, I don’t think the trade-off for that much code for such a
simple likes button makes any sense. This led me to explore other options and
decided that cloud functions might be a great fit for this. I’ve seen coworkers
use AWS lambda functions for various things, but I’ve never had to the
opportunity to try them out myself. The thought of using cloud functions excited
me since I get the benefits of an API server, without managing an API server.

## Planning the API

The API is reasonably straightforward if you think roughly how the user
interacts with a like button. Let's break this down into user stories.

1. As an anonymous user, I want to see the total likes count next to the likes
   button.
1. As an anonymous user, when I click the likes button, it should increment the
   count by one.

Based on those two user stories, we can create two endpoints to satisfy the
requirements. First, we need to fetch the current count for a specific post
using a GET request. Secondly, update that count by one or create a new document
using a PUT request.

## Building the Cloud Function

Lets first start with some of the boilerplate. We’ll create a new directory and
create an index file which can house our function. In the root folder of this
project run the following commands:

```sh
mkdir -p functions/likes && `# Create a new directory called functions/likes` \
  cd functions/likes &&     `# Move into the new directory` \
  touch index.js &&         `# Create a new file called index.js` \
  npm init -y               `# Create a basic package.json file without any configuration`
```

Next, you’ll need to install some of the project's dependencies. For this cloud
function, I have chosen to install Express, Firebase admin and the Firebase
functions packages by running the following `npm` install command:

```shell
npm install express firebase-admin firebase-functions
```

Alternatively, if you prefer [yarn](https://yarnpkg.com):

```shell
yarn add express firebase-admin firebase-functions
```

That takes care of the project's dependencies and the now for actual function.
Open up `index.js` and insert the following boilerplate:

```javascript
// index.js
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')

// Creates an express application which handles the routing
const app = express()

// Initialize the firebase configuration. Since you this is already hosted
// on Google Cloud, you don’t need any additional configuration. It just
// works!
admin.initializeApp(functions.config().firestore)

// This is the main entry point to the function
exports.likes = functions.https.onRequest(app)
```

This is a bare-bones function and doesn't do much at this point. We are
importing a few required packages, configuring the Firebase connection, and then
spinning up an Express server to handle each request. If you were to deploy this
as is and make a request to the functions endpoint, you would get back an `OK`
message from Express.

### Configuring the Routes

#### GET a Document

Starting with the GET request handler, let’s try and think for a second what
this endpoint is going to do. A request from the client hits the Express server
and then matches a specific route. The route needs to include the post ID to
identify which document to query from the database. One caveat here is if the
document doesn’t exist, we should return a default count instead of returning a
404 not found error.

```js
// Reference the firestore database and store it in a variable so we can use it across both functions
const db = admin.firestore()
// Reference the likes collection within the firestore database
const likes = db.collection('likes')

app.get('/:id', (req, res) =>
  likes
    .doc(req.params.id)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        res.status(200).json({count: 0})
      } else {
        res.status(200).send(doc.data())
      }
    }),
)
```

We are using the [Express routing](https://expressjs.com/en/guide/routing.html)
parameters to match the ID. For those not familiar with Express routing, `:id`
is just a variable I defined to match any value included in the route. It then
becomes accessible under the request object `req.params.id`.

The request comes in; we’ll look up a specific document in the likes collection
using the ID. The Firebase API returns an `exists` property we can use to check
if the document was previously in the collection. If the document exists, return
the data by calling `doc.data()` or return a default value of zero.

#### Put to Create or Update a Document

Without knowing much about the Firebase API, some developers may make the
mistake of fetching a document using the `get` method and then calling `set` to
increment the value.

```js
// DON”T DO THIS
likes
  .doc(req.params.id)
  .get()
  .then((doc) => {
    const count = doc.exists ? doc.data().count + 1 : 1
    likes.doc(req.params.id).set({count})
  })
```

Instead of calling `get` and then `set`, fetching and updating a value or
creating a new document altogether should be handled by using transactions.
Transactions allow you to read the document and then update an existing value
while guaranteeing that you are incrementing the latest value.

```js
const put = (req, res) =>
  db
    .runTransaction((transaction) =>
      transaction.get(likes.doc(req.params.id)).then((doc) => {
        const count = doc.exists ? doc.data().count + 1 : 1
        const method = doc.exists ? 'update' : 'set'
        transaction[method](likes.doc(req.params.id), {count})
        return Promise.resolve(count)
      }),
    )
    .then((count) => res.status(200).json({count}))
    .catch((error) =>
      res
        .status(500)
        .json({status: 500, message: 'Failed to update count', error}),
    )
```

Let’s take this line by line since a lot is going on here. First, we start a
transaction against the database and then get the current document by ID.
Firebase returns an object containing two main properties, exists and data. If
the document exists, we’ll increment the current count by one or return a
default value of one. Again, if the document exists, we’ll have to call the
transaction update method to update the existing value. If the document does not
exist, call set instead.

#### Set vs Update

Knowing when to call set over update is important since set overwrites the
existing document entirely. Calling `update` only updates the values you pass
in. Take a look at the following example:

```js
doc.set({active: true, count: 1})
doc.set({count: 2})
//=> { count: 2 }
```

`active: true` would be removed entirely. You can see how this would be a
problem if your object contained more than just `count`. Instead, calling
`update` would only update the `count` and leave `active` intact.

```js
doc.set({active: true, count: 1})
doc.update({count: 2})
//=> { active: true, count: 2 }
```

## Deployment

Now to test out this code in production! You need to have the
[gcloud](https://cloud.google.com/sdk/gcloud/) CLI tools installed locally to
run any of the deployment commands.

```sh
gcloud functions deploy likes `# likes is the name of the Google Cloud Function` \
  --entry-point likes         `# Is referring to the exported module `exports.likes` \
  --runtime nodejs8           `# Use the Node 8 runtime` \
  --trigger-http              `# Since this is an API, an HTTP request triggers this function` \
  --source ./likes            `# The directory of the likes button` \
  --project devin-schulz      `# The name of the project you are deploying. May not be required`
```

Once complete, you should get back a payload containing all the necessary
information about your function. Look for `httpsTrigger.url`, this is the
endpoint you need to hit to invoke the function. In my case, the URL I get back
is `https://us-central1-devin-schulz.cloudfunctions.net/likes`.

Now to create a document, we can use a CURL request to hit the endpoint.

```shell
curl -X PUT https://us-central1-devin-schulz.cloudfunctions.net/likes/32779e118e414d84746d8775451f6de8
```

Furthermore, to return the count:

```shell
curl https://us-central1-devin-schulz.cloudfunctions.net/likes/32779e118e414d84746d8775451f6de8
```

## Conclusion

There you have it, a small single cloud function that acts as an API server to
read and write post likes to a database. All without having to bloat the client
and load the entirety of Firebase for such simple functionality.

This was my first time experimenting with cloud functions, and I think they have
the potential to enhance the overall developer experience when it comes to
creating easy CRUD operations or form submissions. I'll be incorporating them
into more and more side projects and experiment with the
[serverless](https://serverless.com/) framework in the future.

You can view the source of the function on
[Github](https://github.com/devinschulz/blog/blob/master/functions/likes.js).
