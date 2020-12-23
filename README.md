# DevOps Motion

A virtual assistant to help propel your projects toward completion.

## Goals

The purpose of this project is to add a new automated member to your project team.
They will keep an eye on tasks, make sure that work is not dropped, and answer basic questions.

- Notify QA when stories are ready to test
- Determine which build contains the desired work
- Create release notes listing stories completed and bugs fixed between deployments

Motion works with Azure DevOps to keep your projects moving.

## Setup

Install [Node](https://nodejs.org) and [Postgres](https://www.postgresql.org).
Then clone the repository and run:

```bash
npm i
npm run build
npm start
```

The application will walk you through environment and database setup.