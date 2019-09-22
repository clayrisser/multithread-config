#!/bin/bash

npm run start:server &
sleep 1
npm run start:client
