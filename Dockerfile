FROM nginx:1.27-alpine
COPY css /usr/share/nginx/html/css
COPY js /usr/share/nginx/html/js
COPY favicon /usr/share/nginx/html/favicon
COPY index.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY assets /usr/share/nginx/html/assets
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -q --spider http://localhost/ || exit 1
