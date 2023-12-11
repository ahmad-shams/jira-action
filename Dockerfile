FROM node:21.4-alpine3.18
HEALTHCHECK CMD node --version || exit 1

# Set the working directory inside the container
WORKDIR /usr/src

# Copy any source file(s) required for the action
COPY entrypoint.sh main-jira.js package.json /usr/src/

RUN npm install -g

# Configure the container to be run as an executable
ENTRYPOINT ["/usr/src/entrypoint.sh"]
