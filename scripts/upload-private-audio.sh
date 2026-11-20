#!/usr/bin/env bash
# Add an MP3 to the password-locked /audio page (prod Convex storage). The
# audio never goes in git: this repo is public.
#
#   scripts/upload-private-audio.sh <file.mp3> <slug> "<Title>" <order> [--dev]
#
# Re-running with the same slug swaps the file and deletes the old one.
# The page password is the Convex env var AUDIO_PAGE_PASSWORD.
set -euo pipefail

if [ $# -lt 4 ]; then
  echo "usage: $0 <file.mp3> <slug> \"<Title>\" <order> [--dev]" >&2
  exit 1
fi
file="$1" slug="$2" title="$3" order="$4"
target=(--prod)
[ "${5:-}" = "--dev" ] && target=()

url=$(pnpm exec convex run "${target[@]}" privateAudio:generateUploadUrl | jq -r .)
id=$(curl -sS -X POST -H "Content-Type: audio/mpeg" --data-binary @"$file" "$url" | jq -r .storageId)
args=$(jq -nc --arg slug "$slug" --arg title "$title" --arg id "$id" --argjson order "$order" \
  --arg filename "$(basename "$file")" \
  '{slug: $slug, title: $title, filename: $filename, storageId: $id, order: $order}')
pnpm exec convex run "${target[@]}" privateAudio:setTrack "$args"
echo "$slug -> $id"
