# Используем официальный Nginx образ
FROM nginx:alpine

# Копируем статические файлы
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Экспортируем порт
EXPOSE 80

# Nginx уже запускается автоматически