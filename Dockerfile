# Используем официальный Node.js образ
FROM node:24

# Создаём рабочую директорию
WORKDIR /app

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальной код
COPY . .

# Указываем порт (должен совпадать с твоим Express)
EXPOSE 3001

# Команда запуска
CMD ["npm", "run", "start-back-prod"]