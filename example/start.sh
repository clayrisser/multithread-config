#!/bin/bash

npm run start:master &
sleep 1
npm run start:client
