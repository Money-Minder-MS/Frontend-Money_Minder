# Money Minder MS — Frontend

The **Angular** single-page web interface for the Money Minder MS platform. It
talks to the backend through the API Gateway and authenticates via Keycloak.

## Tech stack
Angular 16 · TypeScript · Tailwind CSS

## Prerequisites
Node.js and the Angular CLI (`npm install -g @angular/cli`).

## Run
```bash
npm install
ng serve
```
App: http://localhost:4200

## Build
```bash
ng build        # outputs to dist/
```

## Backend
Expects the Money Minder MS services running behind the
[API Gateway](https://github.com/Money-Minder-MS/API-Gateway) (default `http://localhost:9000`).

## Part of Money Minder MS

Part of the **Money Minder MS** platform. Full architecture and the other services:
[API-Gateway README](https://github.com/Money-Minder-MS/API-Gateway).

