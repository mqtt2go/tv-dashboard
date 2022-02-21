#!/bin/bash
pressed=0
lastBtn="1"
while read oneline
do
   keyline=$(echo $oneline | grep " key ")
   if [ -n "$keyline" ]; then
      last=`date +%s%3N`
      strkey=$(grep -oP '(?<=sed: ).*?(?= \()' <<< "$keyline")
      strstat=$(grep -oP '(?<=key ).*?(?=:)' <<< "$keyline")
      strpressed=$(echo $strstat | grep "pressed")

      if [ "$strkey" == "" ]; then
        continue
      fi

      if [ "$lastBtn" == "$strkey" ]; then
        pressed=$((pressed+1))
      fi

      if [ $pressed -eq 2 ]; then
        pressed=0
      fi

      lastBtn=$strkey

      echo "$pressed"

      if [ $pressed != 0 ]; then   
        continue
      fi

      if [ -n "$strpressed" ]; then
         case "$strkey" in
            "up")
                xdotool key "Up"
                ;;
            "down")
                xdotool key "Down"
                ;;
            "left")
                xdotool key "Left"
                ;;
            "right")
                xdotool key "Right"
                ;;
            "select")
                xdotool key "KP_Enter"
                ;;
            "exit")
                xdotool key "Escape"
                ;;
         esac
      fi 
   fi
done
