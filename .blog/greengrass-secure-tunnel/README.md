# Greengrass - Secure Tunnel

## Raspberry Pi Setup

As usual we will be tackling this problem from the Raspberry Pi (ARM) perspective. I am actually shooting myself in the foot on purpose however, as the documentation for this process is extremely lacking currently.

### Install Pre-requirements

```bash
sudo apt-get install cmake git
```

### Install requirements

```bash
# Zlib dependency
cd ~
wget https://www.zlib.net/zlib-1.2.11.tar.gz -O /tmp/zlib-1.2.11.tar.gz
tar xzvf /tmp/zlib-1.2.11.tar.gz
cd zlib-1.2.11
./configure
make
sudo make install

# Boost dependency
cd ~
wget https://dl.bintray.com/boostorg/release/1.69.0/source/boost_1_69_0.tar.gz -O /tmp/boost.tar.gz
tar xzvf /tmp/boost.tar.gz
cd boost_1_69_0
./bootstrap.sh
sudo ./b2 install

# Protobuf dependency
cd ~
wget https://github.com/protocolbuffers/protobuf/releases/download/v3.11.2/protobuf-all-3.11.2.tar.gz -O /tmp/protobuf-all-3.11.2.tar.gz
tar xzvf /tmp/protobuf-all-3.11.2.tar.gz
cd protobuf-3.11.2
mkdir build
cd build
cmake ../cmake
make
sudo make install

# OpenSSL development libraries
sudo apt install libssl-dev

# Catch2 test framework
cd ~
git clone https://github.com/catchorg/Catch2.git
cd Catch2
mkdir build
cd build
cmake ../
make
sudo make install
```

### Install localproxy

```bash
cd ~
git clone https://github.com/aws-samples/aws-iot-securetunneling-localproxy
cd aws-iot-securetunneling-localproxy
mkdir build
cd build
cmake ../ -DCMAKE_CXX_FLAGS=-latomic
make

# Install binary
sudo cp bin/* /bin/

# Test localproxy
localproxytest
```

## Attribution

* [AWS IoT Secure Tunneling Local Proxy Reference Implementation C++](https://github.com/aws-samples/aws-iot-securetunneling-localproxy)
* [Secure Tunneling Tutorial](https://docs.aws.amazon.com/iot/latest/developerguide/secure-tunnel-tutorial.html)
* [IoT Agent Snippet](https://docs.aws.amazon.com/iot/latest/developerguide/agent-snippet.html)
