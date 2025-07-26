# Use the official Nginx image as the base image
FROM nginx:alpine

# Set maintainer label
LABEL maintainer="mitrhaCoding"
LABEL description="Liquid Sort Game - A web-based puzzle game"

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the game files to nginx html directory
COPY index.html /usr/share/nginx/html/
COPY favicon.ico /usr/share/nginx/html/
COPY src/ /usr/share/nginx/html/src/
COPY package.json /usr/share/nginx/html/

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
