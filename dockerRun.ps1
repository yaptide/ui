ls $PWD/build
docker rm --force yaptide-nginx 
docker run --name yaptide-nginx -p 8080:80 -v $PWD/build:/usr/share/nginx/html:ro -d nginx
