# 370-470_Activity_3
Group 2 Activity 3 Scripts
### Requirements
- Node
- NPM

## GitHub Issues
### Running
```sh
./issues.sh -r [repository] -t [github access token]
```

| Option           | Required? | Description                  | Example                    |
|------------------|-----------|------------------------------|----------------------------|
| `-r`, `--repo`   | Yes       | Sets the GitHub Repository   | `-r obsproject/obs-studio` |
| `-t`, `--token`  | Yes       | Sets the GitHub Access Token | `-t 12345`                 |
| `-o`, `--output` | No        | Sets the output file         | `-o issues.csv`            |

## GitHub Commits
### Running
```sh
./commits.sh -r [repository] -t [github access token]
```

| Option           | Required? | Description                  | Example                    |
|------------------|-----------|------------------------------|----------------------------|
| `-r`, `--repo`   | Yes       | Sets the GitHub Repository   | `-r obsproject/obs-studio` |
| `-t`, `--token`  | Yes       | Sets the GitHub Access Token | `-t 12345`                 |
| `-o`, `--output` | No        | Sets the output file         | `-o commits.csv`           |
## GitHub Code size
### Running
```sh
./code_size.sh -r [repository] -t [github access token]
```

| Option           | Required? | Description                  | Example                    |
|------------------|-----------|------------------------------|----------------------------|
| `-r`, `--repo`   | Yes       | Sets the GitHub Repository   | `-r obsproject/obs-studio` |
| `-t`, `--token`  | Yes       | Sets the GitHub Access Token | `-t 12345`                 |
| `-o`, `--output` | No        | Sets the output file         | `-o code_size.csv`         |

