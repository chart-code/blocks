#!/bin/bash

cd .. && rsync -a --omit-dir-times --no-perms --exclude node_modules  --exclude usercache --exclude .git blocks/ demo@roadtolarissa.com:blocks/

ssh demo@roadtolarissa.com <<'ENDSSH'
  #commands to run on remote host
  cd blocks/ \
  && yarn \
  && bin/forever.sh
ENDSSH
