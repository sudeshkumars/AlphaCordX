# AlphaCordX

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-5865F2?style=flat-square&logo=discord&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazon-aws&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat-square&logo=cloudflare&logoColor=white)

<img width="1280" height="640" alt="Discord bots (1)" src="https://github.com/user-attachments/assets/45b9410c-032a-444d-a42f-18fdb0b7d5a0" />

**A next-generation Discord automation and link tracking framework built with Node.js, Express, and SQLite — deployed on AWS EC2 with Nginx and Cloudflare SSL.**

---

## Overview
AlphaCordX is a production-ready Discord automation platform that combines custom bot hosting, link tracking, and OAuth2 authentication in one lightweight backend.  
It is designed for developers who want a scalable, secure, and easy-to-deploy Discord integration running behind Nginx and Cloudflare.

---

## Features
- Discord.js integration with modular and extendable command handling  
- Dynamic link tracking (`/files/:id`) with database logging  
- OAuth2 authentication for Discord login  
- SQLite database for persistent data storage  
- Nginx reverse proxy configuration for production environments  
- AWS EC2 hosting with Cloudflare SSL  
- Lightweight, easy-to-deploy Node.js application

---

## Installation

```config.josn
{
  "botToken": "YOUR_DISCORD_BOT_TOKEN",
  "clientId": "YOUR_DISCORD_CLIENT_ID",
  "clientSecret": "YOUR_DISCORD_CLIENT_SECRET",
  "redirectUri": "https://yourdomain.com/auth/callback",
  "serverUrl": "https://yourdomain.com",
  "port": 3000
}
```
--

```bash
# Clone the repository
git clone https://github.com/yourusername/AlphaCordX.git
cd AlphaCordX

# Install dependencies
npm install

# Optional
npm install -g pm2
npm start bot.js

# Start the application
npm start

```

- Launch an Ubuntu EC2 instance on AWS.
- Install Node.js, Nginx, and PM2.
- Point your domain to the EC2 instance via Cloudflare.
- Enable SSL using Let’s Encrypt or Cloudflare Flexible SSL.
- Start the application using pm2 start bot.js.

     --  Slasyh command support --
          /cn
          /help

## Tech Stack
| Layer | Technology |
|-------|-------------|
| Backend | Node.js, Express.js |
| Bot Engine | Discord.js |
| Database | SQLite |
| Web Server | Nginx |
| Hosting | AWS EC2 |
| SSL / Security | Cloudflare, Let’s Encrypt |

---
## AlphaCordX – Automate. Track. Connect.

## 📜 License
This project is licensed under the **MIT License** – feel free to use and modify it,  
but without any warranty.  
