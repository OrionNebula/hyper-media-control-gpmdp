# hyper-media-control-gpmdp

[![License](https://img.shields.io/github/license/OrionNebula/hyper-media-control-gpmdp.svg)](LICENSE)
[![hyper](https://img.shields.io/badge/Hyper-v2.0.0-brightgreen.svg)](https://github.com/zeit/hyper/releases/tag/2.0.0)
[![GitHub issues](https://img.shields.io/github/issues/OrionNebula/hyper-media-control-gpmdp.svg)](https://github.com/OrionNebula/hyper-media-control-gpmdp/issues)

> Extend [`hyper-media-control`](https://github.com/OrionNebula/hyper-media-control) with support for [Google Play Music Desktop Player (Unofficial)](https://www.googleplaymusicdesktopplayer.com/).

## Installation

Add `hyper-media-control` and `hyper-media-control-gpmdp` to your Hyper configuration.

## Configuration

`hyper-media-control-gpmdp` defines the following configuration options:

```js
module.exports = {
    config: {
        ...
        hyperMedia: {
            ...
            gpmdp: {
                port: 5672 // The port used to communicate with gpmdp
            }
            ...
        }
    }
}
```