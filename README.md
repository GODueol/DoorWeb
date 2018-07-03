nod# door-web

> A Vue.js project

## Build Setup

``` bash

# Make sure to install firebase-tools
npm install -g firebase-tools

# Login Firebase
 firebase login

# install dependencies
npm install && npm install ./functions

# 빌드 후 배포 방법 (앞에 두 단계가 완료되어있어야하고, 터미널 명령임)
npm run deploy

# cloudFunction 배포 방법
npm run deploy-functions

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
