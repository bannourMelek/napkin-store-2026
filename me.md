# systemD frontend stop it
sudo systemctl stop napkin-frontend.service
sudo systemctl status napkin-frontend.service
sudo nano /etc/systemd/system/napkin-frontend.service

[
    ...
    ExecStart=/home/admin/.nvm/versions/node/v22.23.0/bin/npm run electron
    ...
]

# systemD backend stop it
sudo systemctl stop napkin-backend.service
sudo systemctl status napkin-backend.service


# pull changes 
# cd angular npm i and npm run build-electron
# cd backend npm i 
# add admins 

# systemD backend enable it
# systemD frontend enable it
