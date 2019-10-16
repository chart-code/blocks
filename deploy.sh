cd .. && rsync -a --omit-dir-times --no-perms --exclude node_modules --exclude .git blocks/ demo@roadtolarissa.com:blocks/

ssh demo@roadtolarissa.com <<'ENDSSH'
  #commands to run on remote host
  cd 20-reader/ \
  && yarn \
  && kill -9 $(lsof -t -i:3002 -sTCP:LISTEN)
  yarn run build && PORT=3002 yarn run start
ENDSSH
