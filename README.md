# CMS - Customer Management System & Chat Application 
CMS is Customer Management application build with the power of MERN Stack.

![login page](./images/Screenshot from 2024-09-26 13-41-58.png
)

![home page](./images/Screenshot from 2024-09-26 13-46-45.png)

## Installation Guide

### Requirements
- [Nodejs](https://nodejs.org/en/download)
- [Mongodb](https://www.mongodb.com/docs/manual/administration/install-community/)

Both should be installed and make sure mongodb is running.
### Installation

```shell
git clone https://github.com/GleamSujeet001/CMS-react-nodejs.git
cd CMS-react-nodejs
```

Now install the dependencies
```shell
cd server
npm i
cd ..
cd public
npm i
```
We are almost done, Now just start the development server.

For Frontend.
```shell
cd public
npm run dev
```
For Backend.

Open another terminal in folder, Also make sure mongodb is running in background.
```shell
cd server
npm start
```
Done! Now open http://localhost:5173/ in your browser.
