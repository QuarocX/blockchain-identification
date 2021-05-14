#!/bin/sh

# usage update_addresses.sh HTML_PAGE CTRL_ADDR CRYPTO_ADDR
# example: update_addresses.sh stockapp/admin.html \
#	0x151cb2cf75e266C5491EC3C0aec911fEDa7612A8 0x3009324319C2A35a22BbB1A010671C64dDd82EcC

sed -E "s/voting\.at\((.*)\)/voting\.at\(\"$2\")/g" $1 -i
sed -E "s/contract\.at\((.*)\)/contract\.at\(\"$3\")/g" $1 -i

