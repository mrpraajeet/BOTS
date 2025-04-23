#!/bin/bash
#This is a script that I use to pirate stuff while I am asleep, Unlimited nighttime data go brrr

declare SERIES_DIR="/home/$SUDO_USER/Downloads/Series" #Replace with the Series name
declare EP=1 #Starting episode number for today's batch
declare -a EPISODES=(
  "https://www.digitalocean.com/robots.txt" #Placeholder
  "https://www.digitalocean.com/robots.txt"
)

declare MOVIES_DIR="/home/$SUDO_USER/Downloads/Movies"
declare -a MOVIES=(
  "https://www.digitalocean.com/robots.txt"
)

if [ -z "$SUDO_USER" ]; then
  echo "This script must be run with sudo"
  echo "Preferably create a symlink first"
  echo "sudo ln -s /path/to/Kaizoku.sh /usr/local/bin/kaizoku"
  echo "Then run 'sudo kaizoku'"
  exit 1
fi

sleep 10 #Wait for 10 seconds before the screen goes blank, Use ctrl + c if you change your mind
rtcwake -m mem -t $(date +%s -d "tomorrow 02:09") #Set an alarm to wake up the system at midnight 
xset dpms force off #Turn off the screen to conserve battery and avoid disturbing your sleep
amixer set Master mute #Similarily mute the volume
sudo -u "$SUDO_USER" mkdir -p "$SERIES_DIR" "$MOVIES_DIR" 
#Folders should be owned by the main user instead of root to perform operations (Eg: Delete)

for ((i=0; i<${#EPISODES[@]}; i++))
do
  URL="${EPISODES[$i]}" #Get the URL to replace the filename with ep number
  NUM=$(($EP+$i)) #Double brackets are needed to treat it as arthmetic operation instead of string
  EXT="${URL##*.}" #Extracts everything after the last dot which will be the file extension
  sudo -u "$SUDO_USER" curl -L --retry 5 --retry-delay 10 -o "$SERIES_DIR/$NUM.$EXT" "$URL"
done

for MOVIE in "${MOVIES[@]}"
do
  sudo -u "$SUDO_USER" curl -L --retry 5 --retry-delay 10 -o "$MOVIES_DIR/${MOVIE##*/}" "$MOVIE"
done

shutdown -h now #Shutdown the system gracefully after downloads are complete
exit 0