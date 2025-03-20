FROM node:18

WORKDIR /app

# Set environment variables
ENV NODE_ENV=development
ENV NODE_OPTIONS="--experimental-global-webcrypto"

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
