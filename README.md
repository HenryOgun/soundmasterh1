# Diamond FM Broadcast Automation System

A complete, production-grade broadcast automation platform built for **Diamond FM 88.7 Ilorin** and **Diamond FM 88.5 Ilesa**, Nigeria. Developed in-house to replace commercial broadcast software.

> **Status: Live in production** — running daily across two broadcast stations.

---

## System Overview

The system is made up of four integrated applications:

| App | Description | Port |
|---|---|---|
| **Diamond FM Server** | Central media library and file server | 5743 |
| **Diamond FM Playout** | On-air playout with cart machine and scheduling | 4000 |
| **Diamond FM Traffic Manager** | Ad traffic, campaign management, order/slot scheduling | — |
| **Diamond FM Listener Monitor** | Live listener count and stream health dashboard | 4100 |

---

## Diamond FM Server

Central media server that stores and serves all audio files to connected playout stations.

**Features:**
- Upload and organise audio library (Songs, Jingles, Promos, Stingers)
- Stream audio to any connected Playout PC on the network
- Real-time push to Playout systems via Server-Sent Events (SSE)
- License activation system with HMAC-SHA256 key validation
- Station logo management
- Built-in upload throttling (4 MB/s) to protect streaming bandwidth
- Packaged as a Windows `.exe` installer (electron-builder + NSIS)

**Stack:** Electron · Node.js · Express · SQLite (better-sqlite3) · Multer

---

## Diamond FM Playout

Professional on-air playout software for broadcast stations.

**Features:**
- Dual-deck audio playback with crossfade
- Cart machine (18 instant-play pads) for jingles and stingers
- Playlist scheduling with auto-play
- Browse and stream tracks directly from Diamond FM Server
- Local audio library with waveform editor
- Audio output device selection per deck
- VU meters on all decks and cart pads
- Ad break management
- Single-instance lock, auto-start on boot

**Stack:** Electron · Node.js · Express · SQLite · Web Audio API

---

## Diamond FM Traffic Manager

Ad traffic and campaign management for broadcast commercials.

**Features:**
- Client and order management
- Campaign calendar with visual grid per material
- Slot scheduling with conflict detection
- Traffic log generation and export
- Material duration tracking
- Multi-station support

**Stack:** Node.js · Express · SQLite · JavaScript

---

## Diamond FM Listener Monitor

Real-time listener analytics dashboard.

**Features:**
- Live listener count display
- Stream health monitoring
- Cloudflare Tunnel integration for remote access
- Auto-start on system boot

**Stack:** Electron · Node.js · Express · JavaScript

---

## Architecture

```
Diamond FM Server (PC 1)
    ├── Serves audio files over local network (port 5743)
    ├── SSE push for real-time library updates
    └── REST API for authenticated management

Diamond FM Playout (PC 2, 3, ...)
    ├── Connects to Server at IP:5743
    ├── Streams audio on demand
    └── Local SQLite for schedule and settings

Diamond FM Traffic Manager (Any PC)
    └── Standalone traffic/ad scheduling system

Diamond FM Listener Monitor (Server PC)
    └── Cloudflare Tunnel → public dashboard URL
```

---

## Tech Stack

- **Runtime:** Node.js, Electron 32
- **Backend:** Express.js, REST API, Server-Sent Events
- **Database:** SQLite via better-sqlite3
- **Frontend:** Vanilla JavaScript, Web Audio API, HTML5/CSS3
- **Packaging:** electron-builder (Windows NSIS installer)
- **Security:** JWT authentication, HMAC-SHA256 license keys

---

## Author

**Henry Olabode Ogun**  
Head of Engineering, Diamond FM · Full Stack & Broadcast Systems Engineer  
[henryogun.com](https://www.henryogun.com) · [henryoogun@gmail.com](mailto:henryoogun@gmail.com)
