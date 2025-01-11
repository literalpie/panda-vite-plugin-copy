#!/bin/bash

# Define the string to find and the replacement
find_string=$(cat << 'EOF'
import { css } from "../styled-system/css";

export const a = css({
  display: "flex",
  justifyContent: "center",
  backgroundColor: "red",
});
export const b = css({
  display: "flex",
  justifyContent: "center",
  backgroundColor: "orange",
});
export const c = css({
  display: "flex",
  justifyContent: "center",
  backgroundColor: "blue",
});
export const d = css({
  display: "flex",
  justifyContent: "center",
  backgroundColor: "pink",
});
EOF
)

replace_string='export const mock = "The contents of this file doesnt matter"'

# Use find to locate all files and apply perl for the replacement
find ./src -type f -exec perl -i -0pe "s/\Q$find_string\E/$replace_string/g" {} +