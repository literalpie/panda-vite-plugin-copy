#!/bin/bash

cd ./src

# Create 10 copies
for i in {1..60}
do
    folder_name="many-files_$i"
    mkdir "./many-files/$folder_name"
    for j in {1..1000}
    do
    
    destination_file="./many-files/$folder_name/test_copy_$j.ts"
    cp "./test.ts" "$destination_file"
    done
done