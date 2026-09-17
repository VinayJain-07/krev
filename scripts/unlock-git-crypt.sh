#!/usr/bin/env bash
set -e

# Unlock git-crypt using GIT_CRYPT_KEY environment variable (base64) or a keyfile argument
if [ -n "$1" ] && [ -f "$1" ]; then
  echo "Unlocking git-crypt with provided keyfile: $1"
  git-crypt unlock "$1"
elif [ -n "$GIT_CRYPT_KEY" ]; then
  echo "Unlocking git-crypt with GIT_CRYPT_KEY environment variable..."
  KEYFILE=$(mktemp /tmp/git-crypt-XXXXXX.key)
  echo "$GIT_CRYPT_KEY" | base64 -d > "$KEYFILE"
  git-crypt unlock "$KEYFILE"
  rm -f "$KEYFILE"
  echo "git-crypt successfully unlocked."
else
  echo "ERROR: Neither a keyfile argument nor GIT_CRYPT_KEY environment variable was provided."
  exit 1
fi
