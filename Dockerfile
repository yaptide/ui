FROM nginx
RUN rm /etc/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY build /usr/share/nginx/html
COPY conf /etc/nginx
RUN ls /usr/share/nginx/html