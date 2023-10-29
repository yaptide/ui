# use bash script to get all PR patches from github

import os
import subprocess
import json
# install gh cli tool before running this script

# get all PRs with EuroHPC label and closed state
output = subprocess.check_output(
    "gh pr list --label EuroHPC --state closed --json number", shell=True, text=True)
# read json file
json = json.loads(output)
print(json)

# get patches for each PR
patches = [subprocess.check_output(
    f'gh pr diff {PR["number"]} --patch', shell=True, text=True) for PR in json]

# save patches to files
os.mkdir('patches')
for i in range(len(patches)):
    with open(f'patches/patch{i}.patch', 'w') as f:
        f.write(patches[i])
