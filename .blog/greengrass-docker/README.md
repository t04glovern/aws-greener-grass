# Docker Deployments on Greengrass

AWS IoT Greengrass recently got Docker support; a much needed addition to the suite of edge tooling available at our disposal. As with most new IoT Greengrass feature, it can be a bit bumped to get setup with. I would know, I fought through the setup process on the day of release and encounted a couple quirks that I figure I'll share with the world in the form of an unoffical guide.

What you will learn if you read this guide:

* Installing Docker & docker-compose onto a Raspberry Pi device
* Learn what dependencies you will need installed on non Raspberry Pi devices, and how to find guides for those installations
* How to configure the Docker Application Deployment Connector for IoT Greengrass
* Optionally learn how the deployment process can be codified with [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html)

## Requirements

This post is part of a larger series where we delve into some of the more advanced features of AWS IoT Greengrass. The code in the [t04glovern/aws-greener-grass](https://github.com/t04glovern/aws-greener-grass) will help boostrap all the resources you will need to run this portion of the tutorials. If you would like the most seamless learning experience, ensure you have completed the following posts

* [Greener Grass - Greengrass Device Setup](../device-setup/README.md)

The information below doesn't contain anything super specific to our environment. Once you have a basic device setup and connected to Greengrass, you'll be able to continue with this guide.

## Docker Application Deployment Connector

Under the hood Docker deployments for Greengrass are just made up of a lambda function orchastrating docker-compose commands for you. This process is bundled up into what's called a [Greengrass Connector](https://docs.aws.amazon.com/greengrass/latest/developerguide/connectors-list.html).

There are many connectors available, however the one we're interested in is [Docker Application Deployment](https://docs.aws.amazon.com/greengrass/latest/developerguide/docker-app-connector.html). If you take a look at the requirements for this connector you can begin to see what we will need installed on our Greengrass core device.

* **AWS IoT Greengrass Core v1.10**
  * Should be covered if you've installed Greengrass recently
* **Python 3.7**
  * If running python3.6 instead, upgrade using a relevant guide for your OS
* **A minimum of 36 MB RAM**
  * Hopefully this isn't an issue for you. Note Docker might not always be the best approach.
* **Docker Engine v1.9.1**
  * We'll cover this below
* **Docker Compose**
  * We'll cover this below
* **Linux user with docker daemon permissions**
  * `sudo usermod -aG docker USERNAME` should suffice, but check below beforehand.

For the remaining requirements, I'll hold off discussing them until later in the guide.

## Install Dependencies

The first step is arguably the most difficult (depending on what platform you are using). We need to install [Docker](https://docs.docker.com/install/) and [docker-compose](https://docs.docker.com/compose/) onto our Greengrass Core.

**NOTE**: _Since most of the complexity around getting Docker installed come from the ARM platforms (Raspberry Pi), I've included this setup in the guide. For x86_64 architectures, following the standard documentation (linked below) should work fine._

### Install Docker [Raspberry Pi]

Docker is obviously required for this tutorial, however depending on what device you are using will determine how you install Docker.

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

### Install docker-compose [Raspberry Pi]

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
