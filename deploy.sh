#!/usr/bin/env bash


##
# Run the deployment app stack
##
if [ "${2}" = "app" ]; then
    echo "TARGET_ENVIRONMENT :" ${1}
    echo "DEPLOY_STACK :" ${2}
    make deploy-app-stack ENV="${1}"
fi


##
# Run the deployment app stack
##

if [ "${2}" = "db" ]; then
    echo "TARGET_ENVIRONMENT :" ${1}
    echo "DEPLOY_STACK :" ${2}
    make deploy-db-stack ENV="${1}"
fi