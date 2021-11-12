FROM nginx
COPY build /usr/share/nginx/html
COPY conf /etc/nginx