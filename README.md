# opla-backend

[![Build
Status](https://travis-ci.org/Opla/backend.svg?branch=master)](https://travis-ci.org/Opla/backend)

Opla.ai Backend using Node es7 react and redux.


## Getting started

### Prerequisites

First of all, make sure you have [Node 8.x](https://nodejs.org/en/download/) and
[Yarn](https://yarnpkg.com/en/docs/install) installed.

You will also need [MariaDB 10.2](https://mariadb.org/) or [mysql 5.7](https://www.mysql.com/). We provide a [Docker
Compose](https://docs.docker.com/compose/) configuration to get you started
quickly.

### Installation

1. Install the (dev) dependencies:

    ```
    $ yarn install
    ```

2. Run the configuration tool:

   ```
   $ bin/opla init
   ```

   **Important:** if you want to use Docker Compose, accept all the default
   settings and run `docker-compose up -d`, otherwise configure your MariaDB
   instance.

3. Run the migrations:

   ```
   $ bin/opla migrations up
   ```

4. Start the dev environment:

    ```
    $ yarn dev
    ```

This application should be available at: http://127.0.0.1:8081/.

## Database migrations

We use [flyway](https://flywaydb.org/documentation/) to manage the
database migrations with a specific configuration for this project. By using the
`bin/opla` tool, this configuration is automatically generated and `db-migrate`
is bound to the `bin/opla migrations` command.

### Creating a migration

1. Read about terminology here : https://flywaydb.org/documentation/migrations.

2. Add your migration file to this repo under [migrations/sqls](https://github.com/Opla/backend/tree/master/migrations/sqls)

### Applying migrations

To apply all migrations at once, run:

   ```
   $ bin/opla migrations up
   ```

## Docker image
The CI/CD pipeline produces a Docker image that you can use to run the Backend.

### Environment variables

| env                        | default  | description                                                                                                                         |
|----------------------------|----------|-------------------------------------------------------------------------------------------------------------------------------------|
| SKIP_MIGRATIONS            | false    | Skips the database migration step. Useful for production use, where database schema is most likely already set.                     |
| MIGRATIONS_ONLY            | true     | Only does the migration step. Useful for production use, to use the backend container to initialise the db for the very first time. |
| OPLA_BACKEND_DATABASE_HOST | db       | Database host                                                                                                                       |
| OPLA_BACKEND_DATABASE_NAME | opla_dev | Database name                                                                                                                       |
| OPLA_BACKEND_DATABASE_USER | opla     | Database user                                                                                                                       |
| OPLA_BACKEND_DATABASE_PASS | foo      | Database password                                                                                                                   |

## Deploying to kubernetes
This repo contains a kubernetes chart to deploy opla-backend on a kubernetes cluster.

Once you have a cluster, you can deploy opla-backend, with or without HTTPS, persistence.

### TL;DR
There is a shortcut, if you have `myke`. See below :
You can deploy the FE, with TLS :

Given that you have a domain, you can deploy the backend with :

```
myke deploy --HELM_XTRA_ARGS="--set api.domain=YOUR_DOMAIN"
```

### Requirements

You will need :

- (**required**) a Kubernetes cluster with LoadBalancer support. 
- (**required**) [`nginx-ingress-controller`](https://github.com/helm/charts/tree/master/stable/nginx-ingress) with an IP. Even better if you have a domain name pointing to that IP.
- (**required**) `kubectl` locally
- (**required**) [`myke`](https://github.com/goeuro/myke/) (a yaml version of `make`/Makefile) locally. See [here](https://github.com/goeuro/myke/releases) for installation.`
- (**required**) [`tiller`, `helm`](https://docs.helm.sh/using_helm/)
- (optional) [`cert-manager`](https://github.com/helm/charts/tree/master/stable/cert-manager) for let's encrypt certificates, if needed.
- (optional) [`external-storage/snapshots`](https://github.com/kubernetes-incubator/external-storage/tree/master/snapshot) for snapshots and backups of your database, if you need them.

### Installation

Helm charts get published at https://opla.github.io/backend
You can fetch charts this way : 
```
helm repo add opla-backend https://opla.github.io/backend
helm repo update
helm fetch opla-backend/opla-backend
```

You can then install opla like any other helm application, and edit configuration by specifying your [values.yaml](https://github.com/Opla/backend/blob/master/charts/opla-backend/values.yaml) or using `helm --set ...`.

```
helm repo add opla-backend https://opla.github.io/backend
helm upgrade --install --namespace <YOUR_NAMESPACE> \
  --set namespace=<YOUR_NAMESPACE> \
  --set api.domain=<YOUR_DOMAIN> \
  backend opla-backend/opla-backend
```
TIP: You can use --set api.domain=$IP.xip.io as domain name if you only have an IP for your loadbalancer. 

Your app is then available at http://<YOUR_NAMESPACE>.<YOUR_DOMAIN>/api/v1

In general, if you need more details about how we deploy opla, you can have a look at our [CircleCI config.yaml](https://github.com/Opla/backend/blob/master/.circleci/config.yml), where we run commands to deploy it.

## Contributing

Please, see the [CONTRIBUTING](CONTRIBUTING.md) file.


## Contributor Code of Conduct

Please note that this project is released with a [Contributor Code of
Conduct](http://contributor-covenant.org/). By participating in this project you
agree to abide by its terms. See [CODE_OF_CONDUCT](CODE_OF_CONDUCT.md) file.

## Docker Image

### Configuration
You have 2 options: 
    - pass ENV variables to override config properties one by one. See Dockerfile `ENV` statement for available environment variables.
    - override `default.json` by mounting your own `/src/config/config.json` file. You can create such a file by running `bin/opla init` locally.

## License

opla-front is released under the GPL v2.0+ License. See the bundled
[LICENSE](LICENSE) file for details.
