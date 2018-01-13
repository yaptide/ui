#!/usr/bin/env bash

echo "window.env = {};" > $1/env.js
echo "window.env.BACKEND_PUBLIC_URL = \"$YAPTIDE_BACKEND_PUBLIC_URL\";" >> $1/env.js

nginx -c /etc/nginx/nginx.conf
