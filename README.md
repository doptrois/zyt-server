# zyt-server
The server repo for the web application zyt -> https://github.com/vschefer/zyt

## Basic startup instruction
  1. Clone this project
  2. ```cd``` into the project root folder.
  3. run ```npm i```
  4. Install *mongodb* locally (not with npm)
  5. run ```mongod``` or ```sudo service mongod start``` to start the daemon
  6. To import the database dump run ```mongorestore --drop```
  6. run ```export zyt_jwtPrivateKey=ANY_VALUE_YOU_WANT```. *We used to execute ```export zyt_jwtPrivateKey=DevMachine```*
  7. run ```node index.js``` or ```export DEBUG=app:runtime && nodemon index.js``` to see debugging informations in the console.

## MongoDB Compass

1. Install MongoDB Compass: https://www.mongodb.com/products/compass
2. Start the program.
3. Leave the default values and press *connect*.

## Demo Users

| Admins                                                       | Employees                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| vanessa.schefer@domain.tld<br />michael.fischer@domain.tld<br/> | maximilian.mueller@domain.tld<br />hansruedi.mustermann@domain.tld<br />adrian.musterbergen@domain.tld |

Password for all users: ```zytApp2018!```

## Postman API Documentation

https://documenter.getpostman.com/view/5816654/RznCqzWF

### Hint
 1. Install the Postman app on your device.
 2. Click on the provided API documentation link.
 3. On the documentation page, click on "Run in Postman", at the right top and import the data into your app.

Testing the API manually is now more comfortable.

## Automated tests
1. Stop the node server, that was started via ```node index.js``` or ```nodemon index.js``` etc.
2. Run ```npm test```
