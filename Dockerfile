FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# ビルドしたい場合
# RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]
# CMD ["npm", "start"]