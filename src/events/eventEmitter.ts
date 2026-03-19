
// src/events/eventEmitter.ts

import { EventEmitter } from 'events'

export const emitter = new EventEmitter()
emitter.setMaxListeners(20)