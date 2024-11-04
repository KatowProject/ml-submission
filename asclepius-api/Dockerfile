FROM node:22.11.0
WORKDIR /

# copy env file
COPY .env .env

COPY . .
RUN npm install
EXPOSE 8080
CMD ["npm", "run", "start"]