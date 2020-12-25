export const welcome = String.raw`
________         _______             _____  ___    ____  _
___  __ \___ _   ___ __ \____  _____ __   |/  /___ _/ /_(_)___  ____
__  / / / _ \ | / / / / / __ \/ ___/ _  /|_/ / __ \/ __/ / __ \/ __ \
_  /_/ /  __/ |/ / /_/ / /_/ (__  )  / /  / / /_/ / /_/ / /_/ / / / /
/_____/\___/|___/\____/ .___/____/  /_/  /_/\____/\__/_/\____/_/ /_/
                     /_/
`;

export const installPostgres = `
I'll help you keep your projects moving forward. But first I'll need a little
help myself. I need a PostgreSQL database to store your configuration and
project snapshots.

Please download PostgreSQL from https://www.postgresql.org/download/

Once you have it installed, I'll set up the database.
`;

export const setEnvironmentVariable = (connectionString: string) => `
Please set the environment variable DEVOPS_MOTION_POSTGRESQL to a connection
string.

You can do this in ~/.bashrc or ~/.bash_profile with:

------
export DEVOPS_MOTION_POSTGRESQL=${connectionString}
------

Now let's move on to the next step.
`;

export const postgresAdvice = `
I was not able to connect to your PostgreSQL database. Please check your
credentials and try again.
`;

export const setupScriptAdvice = (databaseName: string) => `
I was not able to read the file ./node_modules/jinaga/setup.sql.
This is the setup script that I need to initialize your ${databaseName} database.
Make sure you are running from the root directory of DevOps Motion, and that
the NPM modules have been initialized.
`

export const errorMessage = (advice: string, err: any) => `
xxxxxxxxx

Something went wrong!
${advice}
${err.message}

xxxxxxxxx`;

export const creatingApplicationUser = (databaseName: string) => `
Now I need to create a user role for the application to use. This role will
have limited access to the ${databaseName} database. What credentials would
you like this user role to have?
`;

export const createUserAdvice = `
I was not able to create the application user.
`;

export const settingUpAzureDevOps = `
Now we need to connect to Azure DevOps. You do not need to be an adminstrator.
You only need to set up an access token for me. First let me know about your
origanization and project, then I'll tell you how to get your access token.

If you go to Azure DevOps in your browser, the URL should look like this:

https://dev.azure.com/<organization>/<project>

Please tell me what those two values are.
`;

export const reconfiguringAzureDevOps = `
You've specified the -r flag, meaning that you want to reconfigure Azure
DevOps. I'll be glad to walk you through that.

Your Azure DevOps site will be at a URL like this:

https://dev.azure.com/<organization>/<project>

Please tell me your Azure DevOps organization and project.
`

export const settingUpAzureDevOpsAgain = `
It looks like you've gone through this process a couple of times already. I
see two configurations, and I don't know which one to use. Let's do this setup
one more time, and I'll fix up your configuration file.

Your Azure DevOps site will be at a URL like this:

https://dev.azure.com/<organization>/<project>

Please tell me your Azure DevOps organization and project.
`

export const getAccessToken = (organization: string) => `
Now open this link in your browser to create a Personal Access Token for me
to use.

https://dev.azure.com/${organization}/_usersSettings/tokens

I will only need these permissions:

  Work Items: Read
  Code: Read
  Build: Read
  Release: Read
`;

export const devOpsAdvice = (organization: string, project: string) => `
I was not able to access your project. Please double-check that you can get
to this URL:

https://dev.azure.com/${organization}/${project}

Then double-check the Personal Access Token.
`;

export const success = `
Awesome! I was able to connect. I will now start up the web server so you
can put your project in motion.
`;