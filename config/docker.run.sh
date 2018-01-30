#!/usr/bin/env bash

echo "window.process = window.process || {};" > $1/env.js
echo "window.process.env = {};" >> $1/env.js
echo "window.process.env.BACKEND_PUBLIC_URL = \"$YAPTIDE_BACKEND_PUBLIC_URL\";" >> $1/env.js

nginx -c /etc/nginx/nginx.conf
