# Terraform Plan Summarizer

## Description

A simple API that summarizes Terraform plan files.

## Quick Start

1. Install dependencies

```bash
$ yarn install
```

2. Create a `.env` file in the root of the project and add the following:

```bash
GEMINI_API_KEY=your-gemini-api-key
```

3. Run the project 

```bash
$ yarn run start:dev
```

4. Test the API sending the output of `terraform plan` to the `/summarize` endpoint.

 - Single file
◊
    ```bash
    $ curl -X POST http://localhost:3000/summarize -F "files=@terraform.tfplan"
    ```

  - Multiple files

    ```bash
    $ curl -X POST http://localhost:3000/summarize -F "files=@terraform.tfplan" -F "files=@terraform.tfplan"
    ```


## Usage

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test
```
