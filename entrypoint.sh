#!/bin/sh -l

time=$(date)
echo ::set-output name=time::$time

echo "📝 Passed arguments: $@"

/node_modules/@betterer/cli/bin/betterer $@
