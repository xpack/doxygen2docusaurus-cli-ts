#!/usr/bin/env bash

# -----------------------------------------------------------------------------
#
# This file is part of the xPack project (http://xpack.github.io).
# Copyright (c) 2024 Liviu Ionescu.  All rights reserved.
#
# Permission to use, copy, modify, and/or distribute this software
# for any purpose is hereby granted, under the terms of the MIT license.
#
# If a copy of the license was not distributed with this file, it can
# be obtained from https://opensource.org/licenses/mit.
#
# -----------------------------------------------------------------------------

# -----------------------------------------------------------------------------
# Safety settings (see https://gist.github.com/ilg-ul/383869cbb01f61a51c4d).

if [[ ! -z ${DEBUG} ]]
then
  set ${DEBUG} # Activate the expand mode if DEBUG is anything but empty.
else
  DEBUG=""
fi

set -o errexit # Exit if command failed.
set -o pipefail # Exit if pipe failed.
set -o nounset # Exit if variable not set.

# Remove the initial space and instead use '\n'.
IFS=$'\n\t'

# -----------------------------------------------------------------------------
# Identify the script location, to reach, for example, the helper scripts.

script_path="$0"
if [[ "${script_path}" != /* ]]
then
  # Make relative path absolute.
  script_path="$(pwd)/$0"
fi

export script_path
export script_name="$(basename "${script_path}")"

export script_folder_path="$(dirname "${script_path}")"
export script_folder_name="$(basename "${script_folder_path}")"

# =============================================================================

# set -x

argv="$@"

if [[ $# -ne 1 ]]
then
  echo "Usage: ${script_name} <reference-folder-path>"
  exit 1
fi

referenceFolderPath="$1"
referenceFileName="$(basename "${referenceFolderPath}")"

baseFolderPath="$(dirname "${referenceFolderPath}")"

cd "${baseFolderPath}"
echo '['
find "${referenceFileName}" -type f -name '*.html' | sort -u | sed -e 's|.*|  { "from": ["&"], "to": "" },|'
echo ']'

echo
echo "'${script_name}' ${argv} done"

# Completed successfully.
exit 0

# -----------------------------------------------------------------------------
