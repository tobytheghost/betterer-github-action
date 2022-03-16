#!/bin/sh -l

time=$(date)
echo ::set-output name=time::$time

echo "::set-output name=pull_request_number::$(gh pr view --json number -q .number || echo "")" || echo "⛔️ Failed to get PR number!"

echo "📝 Passed arguments: $@"

/node_modules/@betterer/cli/bin/betterer $@
