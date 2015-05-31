#TransloadIt Example Application

A simple application which demonstrates how you can use [TransloadIt](https://transloadit.com) for processing images.

In this example application, a user avatar form is "hijacked" sending uploaded images not to the application but to TransloadIt's servers. A series of "robots" then resizes the upload several times over, creating a bunch "derivatives" - different sizes - of the image. The URLs of these derivatives then gets pinged back to the uoload form, which in turn sends those URLs to the application for storage.

This application is designed to accompany this article on SitePoint: [Building a User Avatar Component With Node.js & TransloadIt](http://www.sitepoint.com/user-avatar-component-node-js-transloadit).

##Pre-requisites

* Node.js
* npm
* MongoDB
* Bower

You'll also need an [account with TransloadIt](https://transloadit.com) and an S3 bucket.

##Installation

`npm install`

`bower install`

##Configuration

1. Enter your S3 credentials in template.json
2. Upload the template to TransloadIt
3. Make a note of the template ID
4. Copy the file `config\RENAME_THIS_TO_default.yaml` to `config.yaml`
5. Enter your TransloadIt credentials, along with the template ID from step 3

##Running the Application

`node server.js`

The application will create a dummy user:

**Username**: bob
**Password**: secret

You can then access the application at the following URL:

[http://localhost:4000](http://localhost:4000)

> You can change the port number in `config`default.yaml`
