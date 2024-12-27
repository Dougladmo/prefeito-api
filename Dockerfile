FROM node:latest

WORKDIR /app

COPY . .

# dependências necessárias para compilar o bcrypt (usando Python 3)
RUN apt-get update && apt-get install -y build-essential python3

RUN rm -rf node_modules
RUN npm install

CMD ["npm", "start"]

EXPOSE 3000
