FROM node:22.11.0
WORKDIR /app

ENV PORT=3000
ENV MODEL_URL=http://localhost:5000

COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start"]