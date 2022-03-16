#!/bin/sh -l

time=$(date)
echo ::set-output name=time::$time

echo "📝 Passed arguments: $1"

/node_modules/@betterer/cli/bin/betterer $1
