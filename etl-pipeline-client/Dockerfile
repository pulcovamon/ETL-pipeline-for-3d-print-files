FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json /app/

RUN npm install

COPY . /app

RUN mkdir -p /app/build

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
