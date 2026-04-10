#!/bin/sh
export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:$PATH"
exec /usr/local/bin/node node_modules/next/dist/bin/next dev --webpack "$@"
