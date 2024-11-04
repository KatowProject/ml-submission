FROM node:22.11.0
WORKDIR /app

# copy env file
COPY .env .env

# ignore node_modules to copy only package.json
COPY package.json package.json

# install dependencies
RUN npm install

# copy all files
COPY . .

EXPOSE 8080
CMD ["npm", "run", "start"]