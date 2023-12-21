# Magic Card App

Welcome to the Magic Card App! This project allows you to explore, collect, and even purchase Magic cards using TCGPlayer. Dive into the world of Magic and manage your collection effortlessly.

## Setup

To get started with the project, follow these steps:

### Prerequisites

Make sure you have Node.js installed, version 8 or later.
Make sure to have MongoCommunity Server installed to locally host the database

### Environment Variables

Create two `.env` files:

1. **Backend (.env in ./src/magic_api)**
    - `CONNECTIONSTRING`: MongoDB URL for database connection.
    - `REACT_APP_SERVPORT`: Port number for running the Backend locally in the background.
    - `LOCALDBSTRING`: MongoDB URL for locally connecting to database

2. **Root Directory (.env in repository's root)**
    - `REACT_APP_SERVPORT`: Port number for running the Backend locally in the background.

### Installation

Run the following command to install dependencies:

```bash
npm install
```

## Running the Project

After setting up the environment variables and installing dependencies, use the following commands to run the project:

1. **Database**
    ```
    node ./src/magic_api/createDatabase
    ```

2. **Backend:**
   ```bash
   cd ./src/magic_api
   node app
   ```

3. **Root:**
   ```bash
   npm run start
   ```

## Accessing the App

Once the project is running, access the Magic Card App on any browser locally using the following URL:

```
http://localhost:3000
```

Feel free to explore the app, add cards to your collection, and enjoy the Magic experience!