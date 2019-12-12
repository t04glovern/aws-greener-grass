# Docker for Greengrass

## Setup Docker

Installing Docker is obviously required for this tutorial, however depending on what device you are using will determine how you install Docker.

I recommend referring to the offical [Docker installation documentation here](https://docs.docker.com/v17.09/engine/installation/linux/docker-ce/debian/#set-up-the-repository), however if you are running a Raspberry Pi you can try the commands below:

```bash
# Preinstall some requirements
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    software-properties-common \
    curl

# Use the get-docker script
curl -fsSL get.docker.com -o get-docker.sh && sh get-docker.sh

# Add pi & ggc_user to docker group
# NOTE the pi user is only for Raspberry Pi, and is also optional
sudo usermod -aG docker pi
sudo usermod -aG docker ggc_user

# Import Docker’s official GPG key
curl -fsSL https://download.docker.com/linux/$(. /etc/os-release; echo "$ID")/gpg | sudo apt-key add -

# Confirm the import
sudo apt-key fingerprint 0EBFCD88

# Add docker mirror to sources list
echo "deb https://download.docker.com/linux/raspbian/ stretch stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list

# Update and Upgrade
sudo apt-get update
sudo apt-get upgrade

# Start the docker service (if it isn't already running)
systemctl start docker.service
```

### Install docker-compose

The CLI command docker-compose is also required for the Docker connector to function. This can be installed again by following the [offical documentation on the docker website](https://docs.docker.com/compose/install/)

Most x86 systems should be able to be setup with the following commands, however if you are on Raspberry Pi (ARM), you will need to skip over these steps

```bash
# Download binary
sudo curl -L "https://github.com/docker/compose/releases/download/1.25.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Change privleges
sudo chmod +x /usr/local/bin/docker-compose
```

As mentioned above, on **Raspberry Pi or other ARM devices** you might need to instead install via pip3

```bash
sudo apt-get install \
    libffi-dev \
    libssl-dev \
    python-backports.ssl-match-hostname \
    python3-pip

sudo pip3 install docker-compose
```

Test docker-compose by running the following

```bash
docker-compose -v
# docker-compose version 1.25.0, build b42d419
```
