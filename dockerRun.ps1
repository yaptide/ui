docker run --name some-nginx -p 8080:80 -v $pwd/build:/usr/share/nginx/html:ro -d nginx
