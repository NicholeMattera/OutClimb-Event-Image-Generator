FROM node:lts-alpine AS build
COPY . /app
WORKDIR /app
RUN npm ci
RUN npm run build

FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
