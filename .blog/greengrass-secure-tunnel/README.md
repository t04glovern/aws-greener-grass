# Greengrass - Secure Tunnel

## Build localproxy

---

As usual we will be tackling this problem from the Raspberry Pi 3B+ (armv7l) perspective. I am actually shooting myself in the foot on purpose however, as the documentation for this process is extremely lacking currently.

Currently there are no mirriors of localproxy so you'll either have to:

* Build it yourself
* Use my pre-compiled mirrors

### Ubuntu (x86_64)

The [documentation for this compile](https://github.com/aws-samples/aws-iot-securetunneling-localproxy) should work however to save you sometime I've bundled the binaries and can be downloaded and installed from the following.

```bash
# TODO
```

### Raspberry Pi (armv7l)

Instructions for the Raspberry Pi (arm7l) compile can also be found in the [aws-iot-securetunneling-localproxy repository](https://github.com/aws-samples/aws-iot-securetunneling-localproxy). Before jumping into how to compile however, you can optionally jump in and use the binaries below.

```bash
# TODO
```

#### Install pre-requirements

```bash
sudo apt-get install cmake git
```

#### Install requirements

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

#### Install localproxy

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
```

## Test localproxy

---

Now that the localproxy binary is installed you can run the preflight tests by running the following

```bash
localproxytest
# Test server is listening on address: 127.0.0.1 and port: 39985
# [2019-12-23 11:52:10.957851] [0x7616b3a0] [info]    Starting proxy in source mode
# [2019-12-23 11:52:10.972793] [0x7616b3a0] [trace]   Setting up web socket...
# [2019-12-23 11:52:10.973425] [0x7616b3a0] [info]    Attempting to establish web socket connection with endpoint wss://127.0.0.1:39985
# [2019-12-23 11:52:11.425299] [0x7696c3a0] [info]    Disconnected from: 127.0.0.1:34989
# ...
# ...
# ...
# [2019-12-23 11:52:11.425688] [0x7696c3a0] [trace]   Both socket drains complete. Setting up TCP socket again
# ===============================================================================
# All tests passed (32 assertions in 2 test cases)
```

## Attribution

* [AWS IoT Secure Tunneling Local Proxy Reference Implementation C++](https://github.com/aws-samples/aws-iot-securetunneling-localproxy)
* [Secure Tunneling Tutorial](https://docs.aws.amazon.com/iot/latest/developerguide/secure-tunnel-tutorial.html)
* [IoT Agent Snippet](https://docs.aws.amazon.com/iot/latest/developerguide/agent-snippet.html)
