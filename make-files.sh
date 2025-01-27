#!/bin/bash

cd ./src

if [ -d "./many-files" ]; then
    echo "many-files folder already exists. Skipping the rest of the script."
    exit 0
fi

echo "generating a bunch of files to show the performance difference..."
mkdir ./many-files

# Create 10 copies
for i in {1..15}
do
    folder_name="many-files_$i"
    mkdir "./many-files/$folder_name"
    for j in {1..1000}
    do
    
    destination_file="./many-files/$folder_name/file_$j.tsx"
    cp "./many-files-template.tsx" "$destination_file"
    echo "// $destination_file" >> "$destination_file"
    done
done
