import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    version: "1.0.0",
    title: "Parking Reservation API",
    description: "API documentation for the Parking Reservation System",
    description: "",
  },
  host: "localhost:5000",
  basePath: "/api",
  schemes: ["http"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: "Auth",
      description: "Authentication endpoints",
    },
    {
      name: "Users",
      description: "Users endpoints",
    },
  ],
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      name: "Authorization",
      in: "header",
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  definitions: {},
};

const outputFile = '../swagger/doc/swagger.json';
const routes = ['../src/routes/*.js'];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, routes, doc).then(async () => {
  await import("../src/index.js");
});