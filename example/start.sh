#!/bin/bash

npm run start:master &
sleep 3
npm run start:client
