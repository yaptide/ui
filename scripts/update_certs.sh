#!/bin/bash
docker cp server.key yaptide_ui:/etc/nginx/conf.d/server.key
docker cp server.crt yaptide_ui:/etc/nginx/conf.d/server.crt
docker restart yaptide_ui