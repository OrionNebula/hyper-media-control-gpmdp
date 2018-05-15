import WebSocket from 'ws'
import { EventEmitter } from 'events'
import Dialogs from 'dialogs'

export class HyperMediaGpmdp extends EventEmitter {
  constructor (playerManager, config) {
    super()
    this.gpmdpConfig = Object.assign({
      port: 5672
    }, config.gpmdp || {})
    this.lastStatus = { isRunning: false, track: {} }
    this.dialogs = Dialogs()
  }

  playerName () {
    return 'gpmdp'
  }

  iconUrl () {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAABuwAAAbsBOuzj4gAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAQmSURBVHic7ZtbiE1RGMd/GDEuRXK/GyWXvEiE4kniAcUDGkUuKR7k8oQShbygJFFe8CCXUCIPyAtKueY61FwQE8Y0ojG2hzVH05619/rW3mvvNXOaf30PZ5/vW+u//mftdfnWOtCBDkRhGfASaAAeAhuBHl4Z5Yi5wF8gCFklsALo5I9aPrhC68a3tHvAdG/scsB74gUIUD3kLDDCE8dMUYtZgIL9BPYAvbwwzQg2AhTsA7AO6OKBr3MkEaBgD4HZ+VN2izQCFOwqUJY3cVdwIUAA/AL20g5fCxcCVAH7geE5c3eCNALUAMuBzrmzdogkAjQCB4HeHvg6h60AdcACL0wzgo0Ab4DxfmhmB6kAb4H+njhmCokAtcA4XwRdoSRh3B9gIfAqQewY1EpxGDCo+dknoBq4jdqIeYepB+yzLK8U2AY8MZQbAI+Brc0x3hAnwDugp0VZ5ahFke20Wki+eEGcAPOEZZQAR2LKkdpxoKuDNlkhSoBnyNJhXYEbEWUksevkLEKUAGuF8cci4tPY0fTNkkMnwDdkWeGVmtg4qwhZTYxvbmOCToCLgrhS1OBlI0AYM2J8q3GcmrfZsd0R+Gwi2+3vUGCDwacvMCRtRboeMFkQ90wT57IHBKh1Qhx6AvWoXETiRG1YgCbMWZ0yA/E4AaYBN5vtgSBmtIHL22a/SmCpubmtERbgiyBmtYB4lAALLGNWGbjcDPmfIOJ1l44BEgHyTH0NM3xfF/q8Btisc5QK8FXgM1hYlguY6vqhebZa5ygVQJLV1Q1oUWgAnqNOlbKAeCMlFUAymn4QlrUT6ANMQk1rSWCqq6/m2UmdozQfIHm/awQ+p1HnBAV8F9ZvW1e/0OdjwCGbCnTrgAGGGMk0uDgi1nYWiJsGS1CvWIDaui+MI22zEpxq+L4CeGrwiepxIy14PCI+azQR1fjdwATgskXZ/6HrAQcEcds0cS3tkiamBHXhQvrrbzFwGAsMFHCNhU6AF4K4UszZn8OoQRDU5YqLBv+WVgl0T9s4CaLyATMFseURsS2tCfgs8AvbcheNkyBKgPPC+KJMiASodLjkzL9oU2IBcEZYRlEmRQu2yKKsclQmx7bhVbTRtHiAWorqlptR6AFsR60TTA1/gppOczkYiUpx19J6ORnGNVRPaLSsswyYg9rSFnZ1H1G95BZq9eYd0tPhM7TzmyBRsLkfcJgiFMH2hsg17MaENo8kd4ReI8sctwskvSXWiJq3U29GfCPtPcE6YBft9I4guLsp2oSa2ubnS1+OrEfv38B94G7G9ThH2h7wFzgHjMqZtzOkEeABMCt/ym6RRIBq1N2AovhDlY0A9cAOPN/qco13yEb4Uzg4i2+LuEB84+8AU7yxywGzUb9wuOEVwBKPvHLFEtQBZj1qZF8PdPPKqAMdcI5/Rgag5Sce6dUAAAAASUVORK5CYII='
  }

  playPause () {
    return new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify({
        namespace: 'playback',
        method: 'playPause',
        arguments: []
      }))

      resolve(this.lastStatus)
    })
  }

  nextTrack () {
    return new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify({
        namespace: 'playback',
        method: 'forward',
        arguments: []
      }))

      resolve(this.lastStatus)
    })
  }

  previousTrack () {
    return new Promise((resolve, reject) => {
      this.ws.send(JSON.stringify({
        namespace: 'playback',
        method: 'rewind',
        arguments: []
      }))

      resolve(this.lastStatus)
    })
  }

  activate () {
    this.lastStatus = { isRunning: false, track: {} }
    this.ws = new WebSocket(`ws://localhost:${this.gpmdpConfig.port}`)

    // Once the socket opens, connect to it so we can send commands.
    this.ws.on('open', () => {
      this.ws.send(JSON.stringify({
        namespace: 'connect',
        method: 'connect',
        arguments: ['hyper-media-gpmdp', window.localStorage.getItem('hyper-media-control-gpmdp-code')]
      }))
    })

    this.ws.on('message', event => this.emit('status', this.composeStatus(JSON.parse(event))))
    this.ws.on('close', (code, reason) => {
      this.lastStatus = { isRunning: false }
      this.emit('status', this.lastStatus)
      setTimeout(() => {
        this.deactivate()
        this.activate()
      }, 500)
    })

    this.ws.on('error', () => {
      setTimeout(() => {
        this.deactivate()
        this.activate()
      }, 500)
    })
  }

  deactivate () {
    this.ws.removeAllListeners()
    if (this.ws.readyState === this.ws.OPEN) this.ws.close()
    this.ws = undefined
  }

  composeStatus (event) {
    this.lastStatus.isRunning = true
    switch (event.channel) {
      case 'connect':
        if (event.payload === 'CODE_REQUIRED') {
          this.dialogs.prompt('Enter the code from GPMDP:', response => {
            this.ws.send(JSON.stringify({
              namespace: 'connect',
              method: 'connect',
              arguments: [ 'hyper-media-control-gpmdp', response ]
            }))
          })
          break
        } else {
          window.localStorage.setItem('hyper-media-control-gpmdp-code', event.payload)
          this.ws.send(JSON.stringify({
            namespace: 'connect',
            method: 'connect',
            arguments: [ 'hyper-media-control-gpmdp', event.payload ]
          }))
        }
        break
      case 'track':
        this.lastStatus = Object.assign(this.lastStatus, {
          track: Object.assign(this.lastStatus.track || {}, {
            name: event.payload.title,
            artist: event.payload.artist,
            coverUrl: event.payload.albumArt
          })
        })
        break
      case 'playState':
        this.lastStatus = Object.assign(this.lastStatus, {
          state: event.payload ? 'playing' : 'paused'
        })
        break
      case 'time':
        this.lastStatus = Object.assign(this.lastStatus, {
          progress: event.payload.current,
          track: Object.assign(this.lastStatus.track || {}, {
            duration: event.payload.total
          })
        })
        break
    }

    return this.lastStatus
  }
}
