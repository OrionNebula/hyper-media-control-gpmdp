import { registerSubPlugin } from 'hyper-plugin-extend'
import { HyperMediaGpmdp } from './HyperMediaGpmdp'

export const onRendererWindow = registerSubPlugin('hyper-media-control', HyperMediaGpmdp)
