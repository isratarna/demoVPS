# VPS Deployment Cheatsheet

Assumes: Windows user `Student`, SSH key `s20230204056` / `s20230204056.pub`, VPS user `s20230204056`, VPS IP `187.52.122.100`. Replace these with your own values.

---

## 0. Setup (once)

```powershell
# Fix key permissions (PowerShell, run once)
icacls C:\Users\Student\.ssh\s20230204056 /inheritance:r
icacls C:\Users\Student\.ssh\s20230204056 /grant:r "Student:(R)"
```

## 1. Connect

```powershell
ssh -i C:\Users\Student\.ssh\s20230204056 s20230204056@187.52.122.100
```

Type `yes` on first connect. Verify:

```bash
whoami   # s20230204056
pwd      # /home/s20230204056
```

Exit anytime with `exit`.

## 2. Create project folders (on VPS)

```bash
mkdir -p ~/bookapi/backend/uploads
mkdir -p ~/bookapi/frontend
ls -la ~/bookapi
```

## 3. Upload project (from local PC, new terminal — don't close the SSH session)

```powershell
scp -i C:\Users\Student\.ssh\s20230204056 -r backend/*  s20230204056@187.52.122.100:~/bookapi/backend/
scp -i C:\Users\Student\.ssh\s20230204056 -r frontend/* s20230204056@187.52.122.100:~/bookapi/frontend/
```

## 4. Backend setup (on VPS)

```bash
cd ~/bookapi/backend
npm install

nano ~/bookapi/.env
```

Paste, save (`Ctrl+O`, `Enter`, `Ctrl+X`):

```env
PORT=5056
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=s20230204056
DB_PASSWORD=mypassword
DB_NAME=s20230204056
```

```bash
# IMPORTANT: copy .env into backend/, dotenv only reads the current folder
cp ~/bookapi/.env ~/bookapi/backend/.env
```

## 5. MySQL setup

```bash
sudo mysql
```

```sql
CREATE DATABASE s20230204056;
CREATE USER 's20230204056'@'%' IDENTIFIED BY 'mypassword';
GRANT ALL PRIVILEGES ON s20230204056.* TO 's20230204056'@'%';
FLUSH PRIVILEGES;
EXIT;
```

(If MySQL is in Docker: `sudo docker exec -it mysql-database mysql -uroot -prootpass`)

## 6. Test backend manually

```bash
cd ~/bookapi/backend
node server.js
```

New terminal:

```bash
curl http://127.0.0.1:5056/api/health
```

`Ctrl+C` to stop the manual run once confirmed working.

## 7. Run backend permanently (PM2)

```bash
sudo npm install -g pm2   # only if `pm2 -v` fails

cd ~/bookapi/backend
pm2 start server.js --name backend-s20230204056
pm2 save
pm2 startup              # run the command it prints, then `pm2 save` again
```

## 8. Frontend: install, build, run (PM2)

```bash
cd ~/bookapi/frontend
npm install
npm run build

pm2 start npm --name frontend-s20230204056 -- start -- -p 3066
pm2 save
```

Check everything:

```bash
pm2 status
```

## 9. Nginx reverse proxy

```bash
sudo apt update
sudo apt install -y nginx

sudo nano /etc/nginx/sites-available/s20230204056.conf
```

```nginx
server {
    listen 80;
    server_name s20230204056.test;

    location /s20230204056/vps-demo/api/ {
        proxy_pass http://127.0.0.1:5056/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /s20230204056/vps-demo/ {
        proxy_pass http://127.0.0.1:3066/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

> Keep the `/api/` suffix on both the `location` path and `proxy_pass` URL — dropping it causes `Route not found`. Keep the trailing `/` on `proxy_pass` — dropping it causes `ERR_TOO_MANY_REDIRECTS`.

```bash
sudo ln -s /etc/nginx/sites-available/s20230204056.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Test through Nginx:

```bash
curl -H "Host: s20230204056.test" http://127.0.0.1/s20230204056/vps-demo/api/health
```

Open firewall:

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## 10. Map a local test domain (Windows, admin PowerShell)

```powershell
takeown /f C:\Windows\System32\drivers\etc\hosts
icacls C:\Windows\System32\drivers\etc\hosts /grant Administrators:F
ren C:\Windows\System32\drivers\etc\hosts hosts.old
```

Create `C:\Users\Public\hosts` containing:

```text
187.52.122.100 s20230204056.test
```

```powershell
copy C:\Users\Public\hosts C:\Windows\System32\drivers\etc\hosts
ipconfig /flushdns
ping s20230204056.test
```

## 11. Final check in browser

```
http://s20230204056.test/s20230204056/vps-demo/
http://s20230204056.test/s20230204056/vps-demo/api/health
```

---

## Quick fixes for the errors you'll actually hit

| Symptom | One-line fix |
|---|---|
| `Identity file not accessible` | Path is wrong — use the exact key path, not `.pub` |
| `npm ERR!` on install | `rm -rf node_modules package-lock.json && npm install` |
| `Access denied for user ''@'localhost'` | `.env` not in backend folder — `cp ~/bookapi/.env ~/bookapi/backend/.env` |
| `EADDRINUSE` | Port taken — change `PORT` in `.env`, restart |
| `{"error":"Route not found"}` | `proxy_pass` missing `/api/` — add it back, `nginx -t && systemctl reload nginx` |
| `ERR_TOO_MANY_REDIRECTS` | `proxy_pass` missing trailing `/` — add it, reload Nginx, clear cookies |
| Hosts file `Access denied` | Use `takeown` + `icacls` + rename + copy sequence in section 10 — don't fight it with `Add-Content` |
| PM2 forgets app after reboot | `pm2 save` after every `pm2 start`, plus run `pm2 startup` once |

Full explanations: see [bookapi/README.md](bookapi/README.md).
