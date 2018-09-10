# Instex API

## Setup
Install packages:
```sh
$ yarn
```

## Database
Creating database and user in PostgreSQL:
```sh
CREATE DATABASE instex;
CREATE USER instex WITH password 'instex';
GRANT ALL ON DATABASE instex TO instex;
```

For test environment:
```sh
CREATE DATABASE instextest;
CREATE USER instextest WITH password 'instextest';
GRANT ALL ON DATABASE instextest TO instextest;
```

## CLI commands
Run unit tests
```sh
npm run test
```
Reinitialize dev database (delete existing one)
```sh
npm run initializeDevDB
```
Reinitialize test database (delete existing one)
```sh
npm run initializeTestDB
```
Establish new dev seeds
```sh
npm run plantDevFixtures
```
Establish new test seeds
```sh
npm run plantTestFixtures
```
### Swagger API documentation
Documentation available on api root path

### Database migrations

## Run dev server
```sh
$ npm start
```
# JSONAPI
The server supported JSONAPI.
A SPECIFICATION FOR BUILDING APIS IN JSON.
http://jsonapi.org/
## Filtering
JSONAPI specification is agnostic about filtering strategies supported by a server.
We have to use our own filter specification that described below.
### DeliverMD filtering
In simple filtering, we assume all arguments are chained via AND operators. To perform filtering on a field, you put the field name in brackets and append the operation to the end.  For example:
```
filter[id.eq]=1
filter[id.ne]=2
filter[score.gt]=5
filter[score.ge]=5
filter[score.lt]=5
filter[score.le]=5
filter[title.like]=%Hello%
filter[id.in]=[1, 2, 3]
filter[id.notin]=[1, 2, 3]

filter: {
  "id": {
    "eq": 1,
    "ne": 2,
    "in": [1, 2, 3],
    "notin": [1, 2, 3 ]
  },
  "score": {
    "gt": 5,
    "gte": 5,
    "lt": 5,
    "lte": 5,
  },
  "title": {
    "like": "%Hello%",
  }
}
```

And of course across relationships, some will work:

```
filter[author.email.eq]=myemail@example.com
```

### DeliverMD searching
In simple searching, we assume all arguments are chained via OR operators. To perform filtering on a field, you put the field name in brackets.
Fields available for searching descibed in swagger doc for every resource.
Some fields may have custom search engine(for specific search cases). This custom search fields desribed in swagger.
```
search[firstName]=searchValue
search[lastName]=searchValue

search: {
  "firstName": "searchValue",
  "lastName": "searchValue",
}
```
