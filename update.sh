#!/usr/bin/env bash
set -euo pipefail

echo "== Journal update =="

git pull
./deploy.sh
