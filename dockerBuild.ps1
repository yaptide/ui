docker build -t yaptide-web_dev-nginx .
docker rm --force yaptide-web_dev-nginx-container
docker run --name yaptide-web_dev-nginx-container  -p 8080:80  -d yaptide-web_dev-nginx
