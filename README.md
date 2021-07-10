# Starter Kit

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

 - [x] Full stack ES8+ with [Babel]
 - [x] [Node] LTS support (verified working on 10.x, 12.x and 14.x LTS releases)
 - [x] [Express] server
 - [x] [React] client with [Webpack]
 - [x] Client-side routing with [React Router]
 - [x] Linting with [ESLint]
 - [x] Dev mode (watch modes for client and server, proxy to avoid CORS issues)
 - [x] Production build (single deployment artifact, React loaded via CDN)
 - [x] [Heroku] deployment
 - [x] [Cloud Foundry] deployment
 - [x] [Docker] build
 - [x] [Postgres] database with [node-postgres]

## Setup

Pick one member of the team to own the repository and pipeline. That person should do the following:

 1. Click the "Use this template" button above (see [GitHub's docs][1]) to create your team repository, select "Include all branches" and name it something appropriate for your project.
 2. In your new repo, go to "Settings", then "Branches", then switch the default branch to `postgres` (_optional_: you can now delete the old `master` branch and rename `postgres` to `master`, `main` or whatever else you'd like) - see [GitHub's docs][2] again
 3. In your repo, click the "Deploy to Heroku" button at the top of the README and create a Heroku account when prompted.
 4. Fill in the name of the application, select Europe and then click "Deploy App".
 5. Once it has deployed successfully, click the "Manage app" button to view the application details.
 6. Go to the "Deploy" tab, select "Connect to GitHub" and choose your repo.
 7. Click "Enable automatic deploys".

Whenever you commit to master (or e.g. merge a [pull request]) it will get automatically deployed!

You should now make sure all of the project team are [collaborators] on the repository.

## Scripts

Various scripts are provided in the package file, but many are helpers for other scripts; here are the ones you'll
commonly use:

 - `dev`: starts the frontend and backend in dev mode, with file watching (note that the backend runs on port 3100, and
    the frontend is proxied to it).
 - `lint`: runs ESLint against all the JavaScript in the project.
 - `serve`: builds and starts the app in production mode locally.

### Debugging

While running the dev mode using `npm run dev`, you can attach the Node debugger to the server process via port 9229.
If you're using VS Code, a debugging configuration is provided for this.

There is also a VS Code debugging configuration for the Chrome debugger, which requires the recommended Chrome
extension, for debugging the client application.

### Troubleshooting

See the guidance in the [wiki].

  [1]: https://docs.github.com/en/free-pro-team@latest/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template#creating-a-repository-from-a-template
  [2]: https://docs.github.com/en/github/administering-a-repository/managing-branches-in-your-repository
  [Babel]: https://babeljs.io/
  [Cloud Foundry]: https://www.cloudfoundry.org/
  [collaborators]: https://help.github.com/en/articles/inviting-collaborators-to-a-personal-repository
  [Docker]: https://www.docker.com
  [ESLint]: https://eslint.org/
  [Express]: https://expressjs.com/
  [Heroku]: https://www.heroku.com/
  [Node]: https://nodejs.org/en/
  [node-postgres]: https://node-postgres.com/
  [Postgres]: https://www.postgresql.org/
  [pull request]: https://help.github.com/en/articles/about-pull-requests
  [React]: https://reactjs.org/
  [React Router]: https://reactrouter.com/web
  [Webpack]: https://webpack.js.org/
  [wiki]: https://github.com/textbook/starter-kit/wiki


## Glossary Project Back End

This project uses a Postgres database.

### Terms

Terms consist of the term itself and its definition.  The database also holds the name of the contributor who created it (or last edited it), plus the creation date and the last edit date.  Each term has a unique `id`


### Term resources

Term resources are associated with a specific term.  They need the `id` of the term they are associated with, plus a `link` and a `linktype`.  The link type is either `video` (for YouTube or other video resources) or `web` for links to web sites.  Finally each term resource has a `language` property to identify the programming language.


### Contributors

Contributors are users who can update the database.


### Administration

Admin users are another kind of user


### Authentication

The API uses JSON Web Tokens for authentication.  The `/contributor/login` function will return a token which is valid for one hour, and a user ID.
```
{
    "auth": "eyJhbGciOiJIUz..",
    "userid":userid
}
```
The client should return an `Authorization` header containing the token for all operations that add/edit/delete terms or their resources.  The header should look like this:
```
Authorization: Bearer "eyJhbGciOiJIUz.."
```

See [https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs](https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs) for a tutorial on this kind of authentication.

### Environment configuration

The `.env` file for the API server should look like this:
```
TOKEN_SECRET=
DB_HOST=localhost
DB_USER=user
DB_PORT=3306
DB_PASSWORD=password
DB_NAME= glossary
WEB_PORT=3000
USE_AUTH=true
```

The `TOKEN_SECRET` is generated with
```
require('crypto').randomBytes(64).toString('hex')
```
The `USE_AUTH` variable should be set to either `true` or `false`.  If you set it to `false`, the API will **not** use any authentication.
Adjust the other environment variables according to your system.

### API

Here is a list of the API functions.  The ones labelled with `(AUTH)` require authorization as described above.

1. `GET /terms` will return all terms as a JSON list
2. `POST /terms/add` will insert a new term.  Parameters are `term`, `definition`, and `contributorId` (AUTH)
3. `POST /terms/update` will update a term.  Parameters are `termid`, `term`, `definition`, `contributorId` (AUTH)
4. `POST /terms/delete` will delete a term.  Parameters are `termid` (AUTH)
5. `GET /term/resources` will return all resources associated with a term.  Parameters are `termid`
6. `POST /terms/resources/add` will insert a new resource for a specific term.  Parameters are `termid`, `link`, `linktype` (`video` or `web`), `language` (AUTH)
7. `POST /terms/resources/update` will update a resource for a specific term.  Parameters are `resourceid`, `termid`, `link`, `linktype` (`video` or `web`), `language` (AUTH)
8. `POST /terms/resources/delete` will delete a resource.  Parameters are `resourceid` (AUTH)
9. `GET /contributors` will return a list of contributors (id, name and email) (AUTH)
10. `POST /contributor/login` checks the email and password of a contributor and returns an auth token as described above.  Parameters are `email`, `password`.
11. `POST /newContributor` adds a new contributor to the database.  Parameters are `name`, `email`, `region`, `password`. (AUTH)

### Database

There are four tables:
1. `admins` containing administrator users (no API functions yet)
   ```
   Table "public.admins"
        Column     |          Type          | Collation | Nullable |              Default               
   ----------------+------------------------+-----------+----------+------------------------------------
    id             | integer                |           | not null | nextval('admins_id_seq'::regclass)
    admin_name     | character varying(100) |           | not null | 
    email          | character varying(100) |           |          | 
    admin_password | character varying(30)  |           |          | 
   Indexes:
       "admins_pkey" PRIMARY KEY, btree (id)
   ```
2. `contributors` containing all the contributors.
   ```
   Table "public.contributors"
         Column      |          Type          | Collation | Nullable |                 Default                  
   ------------------+------------------------+-----------+----------+------------------------------------------
    id               | integer                |           | not null | nextval('contributors_id_seq'::regclass)
    contributor_name | character varying(120) |           | not null | 
    region           | character varying(20)  |           | not null | 
    email            | character varying(30)  |           |          | 
    password         | text                   |           | not null | 
   Indexes:
       "contributors_pkey" PRIMARY KEY, btree (id)
   Referenced by:
       TABLE "terms" CONSTRAINT "terms_contributor_id_fkey" FOREIGN KEY (contributor_id) REFERENCES contributors(id)
   ```
3. `terms` containing all the terms.  Terms require a valid contributor `id`.
    ```
    Table "public.terms"
        Column     |            Type             | Collation | Nullable |          
       Default              
   ----------------+-----------------------------+-----------+----------+-----------------------------------
    id             | integer                     |           | not null | nextval('terms_id_seq'::regclass)
    term           | character varying(30)       |           | not null | 
    definition     | text                        |           | not null | 
    contributor_id | integer                     |           |          | 
    creation_date  | timestamp without time zone |           |          | CURRENT_TIMESTAMP
    last_edit_date | timestamp without time zone |           |          | 
   Indexes:
       "terms_pkey" PRIMARY KEY, btree (id)
   Foreign-key constraints:
       "terms_contributor_id_fkey" FOREIGN KEY (contributor_id) REFERENCES contributors(id)
   Referenced by:
       TABLE "term_resources" CONSTRAINT "term_resources_termid_fkey" FOREIGN KEY (termid) REFERENCES terms(id)
   Triggers:
       set_timestamp BEFORE UPDATE ON terms FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp()
   ```
4. `term_resources` this table will allow a link to be associated with a term.  It requires a term `id` and a `linktype` which is either `video` or `web`.
    ```
    Table "public.term_resources"
      Column  |          Type          | Collation | Nullable |                  Default                   
    ----------+------------------------+-----------+----------+--------------------------------------------
     id       | integer                |           | not null | nextval('term_resources_id_seq'::regclass)
     termid   | integer                |           |          | 
     link     | text                   |           | not null | 
     linktype | link_t                 |           | not null | 
     language | character varying(255) |           | not null | 
    Indexes:
        "term_resources_pkey" PRIMARY KEY, btree (id)
    Foreign-key constraints:
        "term_resources_termid_fkey" FOREIGN KEY (termid) REFERENCES terms(id)
    ```


### To Do
