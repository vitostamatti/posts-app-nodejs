
<h1 align="center">Posts API Nodejs</h1>


<p align="center"> 
    A basic CRUD API of Posts with users JWT authentication.
    <br> 
</p>


## Getting Started <a name = "getting_started"></a>

First you need to clone this repository.

```bash
git clone https://github.com/vitostamatti/posts-app-nodejs/ 
```

Setup your environment variables in an .env file.
```conf
PORT=8000
NODE_ENV=development

POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=6500
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=db

# generated with https://travistidwell.com/jsencrypt/demo/ and https://www.base64encode.org/
JWT_ACCESS_TOKEN_PRIVATE_KEY=...
JWT_ACCESS_TOKEN_PUBLIC_KEY=...
JWT_REFRESH_TOKEN_PRIVATE_KEY=...
JWT_REFRESH_TOKEN_PUBLIC_KEY=...

# generate with https://ethereal.email/
EMAIL_USER=ultjqzj22z6pdam6@ethereal.email
EMAIL_PASS=3cYeRDWFTQgtnzNWyJ
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
```

Then cd into the posts-app-nodejs directory and run 


```
docker compose up
```

Finally run

```
npm start
```


If you don't have docker installed you first need to [download](https://www.docker.com/) it.

## Usage <a name="usage"></a>

When the docker containers are running you can start playing with the app.

You can interact with the api listening on [localhost/8000](http://localhost/8000) I recommend using a tool to create requests like [postman](https://www.postman.com/).

The available endpoints are:
- api/users/register (POST): to create new users.
- api/users/login (POST): to create new users.
- api/users/profile (GET): to get the current user authenticated with the given token.
- api/posts (GET): to get all the notes from the current user loged in. Make sure you pass the authentication token as a bearer token in the header of the request.
- api/posts (POST): to create a new note with a **name** and a **content** fields.
- api/posts/{id} (GET): to get a particular note by its ID passed in the request path.
- api/posts/{id} (PATCH): to update an existing note with the passed ID.
- api/posts/{id} (DELETE): to delete an especific note with the passed ID.


If you want to see what's happening in the databases

- [localhost/5050](http://localhost/5050) for postgres admin page: login with admin@gmail.com - admin
- [localhost/8001](http://localhost/8001) for redis insight page: login just with the hostname and port.



