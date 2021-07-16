# R.S. Drum Studio - BackEnd

## App Description

This project is designed to enable R.S. Drum Studio to augment their in-person learning. It allows for:

- Currated video collections with titles and descriptions, searchable by tags
- Online payments through Stripe and retrievable payment history
- CRUD lesson packages for in person instruction options
- Full user CRUD
- Mailgun messages for propsective customers with hosted domain
- Lesson Creation with the following features:
  - Fully customizable by instructor
  - Assignable to particular students by instructor
  - Lesson descriptions
  - Assignments which contain instructions, music sheets, links to an instructor generated GrooveScribe (online drum software)
  - Comments which allow for student feedback and further instruction or clarifcation from the instructor with unread indicators
  - All lessons and assignments are CRUD-able

This project is hosted via AWS(DynamoDB, Elastic Beanstalk, Amplify, Route 53)

[R.S. Drum Studio production site](https://www.rsdrum.com)

## Frontend

Go to [GitHub-rsdrumFrontend](https://github.com/jonnyschult/rsdrumFrontend) and follow the instructions on the README

## Backend

This is a bit of work to get up and going locally, mostly because it requires you to install and run a local version of DynamoDB, but you can see the functionality for an instructor when you have it running locally.

**Contact form and Payments will not work in local development without setting up a test Stripe and mailgun email**

- Requirements:
  - Node
  - Nodemon (could avoid if you change the dev script)
  - AWS CLI
  - npm or yarn
  - DynamoDB Local

### Server and DB setup

- **[DynamoDB Instructions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)** - Follow the instructions to download a local version of DynamoDB
- Start DynamoDB local instance
  - Instructions are in documentation, but you can go to the directory holding the DynamoDBLocal.jar and README.txt files, run `cat README.txt`. At the bottom is a command, `java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar` run this command to start a local instance of DynamoDB.
- Once downloaded, run this command with the AWS CLI :
  ```console
    $ aws dynamodb create-table \
    --table-name rsdrum \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=category,AttributeType=S \
    --key-schema \
        AttributeName=category,KeyType=HASH \
        AttributeName=id,KeyType=RANGE \
  --provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000
  ```
- add .env to backEnd directory with following parameters:
  - PORT = 4040
  - DB_ENDPOINT = http://localhost:8000
  - AWS_ACCESS_KEY = Whatever
  - AWS_SECRET_KEY = Whatever
  - JWT_SECRET = localhostsecret
  - STRIPE_SECRET = N/A
  - MAILGUN_KEY = N/A
  - MAILGUN_DOMAIN = N/A
  - ADMIN_PASS = SecurityIsKey!

### Start server

- run `npm install` or `yarn install`
- run `npm run dev` or `yarn dev`

### Create admin user

- Once the nodemon server is running either use cURL or Postman to add an admin user.
  - **_It is essential, if you are creating an admin user, to have the password set to "SecurityIsKey!" or whatever value is passed to ADMIN_PASS in .env_**
  - **_ Make sure the local instance of DynamoDB is running _**
  - cURL:
    - `curl --header "Content-Type: application/json" --request POST --data '{ "info": { "email": "admin@test.com", "firstName": "Buddy", "lastName": "Rich", "password": "SecurityIsKey!", "DOB": "09/30/1917", "admin": true, "student": false, "active": true}}' http://localhost:4040/users/register`
  - postman
    - url: http://localhost:4040/users/register
    - Content-Type: application/json
    - Under body, select "raw" and then drop down to JSON and add the following
    ```json
    {
      "info": {
        "email": "admin2@test.com",
        "firstName": "Buddy",
        "lastName": "Rich",
        "password": "SecurityIsKey!",
        "DOB": "09/30/1917",
        "admin": true,
        "student": false,
        "active": true
      }
    }
    ```

### Conclusion

The server should now be running and your admin user should be avaible to login. Keep the server and DB instance running and start up the front end. You should have privileges to create lessons, assignments, add videos, create lesson packages and manage other users. As noted above, you cannot create payments or send a message from the contact forms.
