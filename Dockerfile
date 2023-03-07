FROM node:18.14.2-alpine AS build

USER node

# Disable husky
ENV HUSKY=0

WORKDIR /app

# Copy package.json and package-lock.json
COPY --chown=node:node package*.json .

# Install all dependencies (since build won't work without them)
RUN npm ci

# Copy the app
COPY --chown=node:node . .

# Set production environment
ENV NODE_ENV=production

# Build for production
RUN npm run build

# Disable prepare script so husky is not run while installing deps for production
RUN npm pkg delete scripts.prepare

# Leave only production dependencies to create smaller image
RUN npm ci --omit=dev && npm cache clean --force

FROM node:18.14.2-alpine

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

# Start the server using the production build
CMD [ "node", "dist/src/main.js" ]