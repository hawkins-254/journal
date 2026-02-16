#!/usr/bin/env bash
set -euo pipefail

APP_NAME="journal"
APP_PORT="${PORT:-3005}"

echo "== Journal deploy =="

# Check Node/npm
command -v node >/dev/null || { echo "Node.js is missing. Install it first."; exit 1; }
command -v npm  >/dev/null || { echo "npm is missing. Install it first."; exit 1; }

# Install deps
echo "-> Installing dependencies..."
npm ci || npm install

# Check PM2
if ! command -v pm2 >/dev/null; then
  echo "-> PM2 not found. Installing globally (needs sudo)..."
  sudo npm i -g pm2
fi

# Start / restart app
echo "-> Starting app with PM2..."
if pm2 list | grep -q " ${APP_NAME} "; then
  pm2 restart "${APP_NAME}" --update-env
else
  pm2 start server.js --name "${APP_NAME}" --time
fi

# Save process list for reboot
pm2 save

echo "-> Done."
echo "Open: http://localhost:${APP_PORT}"
echo "LAN : http://<your-debian-ip>:${APP_PORT}"
