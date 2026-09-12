# Book Management System (bookapi)

A simple full-stack project for practicing VPS deployment: Next.js frontend, Express backend, MySQL database.

## Folder Structure

```
bookapi/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── routes/
│   ├── controllers/
│   ├── database/
│   └── .env.example
├── frontend/
│   ├── package.json
│   └── pages/
├── .env.example
└── README.md
```

## Features

- View books
- Add a book
- Delete a book
- Search books by title/author
- REST API backend, Next.js frontend

## Ports

- Backend API: `5000`
- Frontend (Next.js): `3000`
- MySQL: `3307` (adjust to your setup, default MySQL port is `3306`)

---

## 1. Run Locally

### Prerequisites

- Node.js 18+
- MySQL server running

### Backend

```bash
cd backend
cp .env.example .env
# edit .env with your MySQL credentials
npm install
npm run dev
```

Backend runs on `http://localhost:5000`. Test it:

```bash
curl http://localhost:5000/api/health
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
# set NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

---

## 2. MySQL Setup

Log into MySQL and create the database (or let the backend auto-create the table on startup):

```sql
CREATE DATABASE bookapi;
```

The backend automatically creates the `books` table on startup (see `backend/database/db.js`). Alternatively, run the schema manually:

```bash
mysql -u <user> -p bookapi < backend/database/schema.sql
```

`books` table columns: `id`, `title`, `author`, `created_at`.

---

## 3. VPS এ ঢোকা (SSH দিয়ে Login করা)

VPS এ ফাইল আপলোড বা কোনো কমান্ড চালানোর আগে নিজের PC থেকে SSH দিয়ে VPS এ ঢুকতে হবে। নিচের ধাপগুলো ক্রমানুসারে অনুসরণ করো — কোনো ধাপ স্কিপ করবে না।

### Step 1 — Windows username বের করা

প্রথমে তোমার Windows PC এর username বের করতে হবে, কারণ private key এর permission দেওয়ার সময় এই username লাগবে।

PowerShell খুলে লিখবে:

```powershell
whoami
```

Example output:

```text
Student
```

অথবা:

```text
DESKTOP-XXXXX\Student
```

এখানে `Student` হলো Windows username। যদি output এ `DESKTOP-XXXXX\Student` এরকম আসে, তাহলে পুরোটা না নিয়ে শুধু user অংশ (`Student`) ব্যবহার করবে।

### Step 2 — Private key location বের করা

তোমার private key কোথায় আছে সেটা জানতে হবে।

Example:

```text
C:\Users\Student\.ssh\s20230204056
```

মনে রাখবে:

- Private key: `s20230204056`
- Public key: `s20230204056.pub`

SSH login এর জন্য সবসময় **private key** ব্যবহার করবে। `.pub` ফাইল ব্যবহার করবে না।

### Step 3 — VPS username এবং IP নিশ্চিত করা

VPS username:

```text
s20230204056
```

VPS IP:

```text
187.52.122.100
```

### Step 4 — Private key permission ঠিক করা

PowerShell এ লিখবে:

```powershell
icacls C:\Users\Student\.ssh\s20230204056 /inheritance:r
```

এরপর:

```powershell
icacls C:\Users\Student\.ssh\s20230204056 /grant:r "Student:(R)"
```

Permission check করার জন্য:

```powershell
icacls C:\Users\Student\.ssh\s20230204056
```

Output এ তোমার Windows user থাকা উচিত।

### Step 5 — SSH দিয়ে VPS এ প্রবেশ করা

Command format:

```powershell
ssh -i PRIVATE_KEY_PATH VPS_USERNAME@VPS_IP
```

তোমার ক্ষেত্রে:

```powershell
ssh -i C:\Users\Student\.ssh\s20230204056 s20230204056@187.52.122.100
```

### Step 6 — প্রথমবার connection হলে

এমন message আসতে পারে:

```text
Are you sure you want to continue connecting?
```

লিখবে `yes` এবং Enter চাপবে।

### Step 7 — VPS এ ঢুকেছি কিনা যাচাই করা

Login সফল হলে prompt পরিবর্তন হবে।

Windows এ থাকলে:

```powershell
PS C:\Users\Student>
```

VPS এ ঢুকলে:

```bash
s20230204056@srvxxxxx:~$
```

তারপর নিশ্চিত হওয়ার জন্য:

```bash
whoami
```

Output:

```bash
s20230204056
```

মানে তুমি VPS এর ভিতরে আছো। আরও check করতে:

```bash
pwd
```

Output:

```bash
/home/s20230204056
```

এবং:

```bash
ls
```

দিয়ে VPS এর ফাইল দেখতে পারবে।

### VPS থেকে বের হতে

```bash
exit
```

এটাই পুরো VPS login process — Windows username বের করা থেকে শুরু করে VPS এ সফলভাবে ঢোকা পর্যন্ত। এরপর নিচের ধাপগুলো অনুসরণ করে প্রজেক্ট deploy করবে।

---

## 4. VPS Deployment Manual — Part 2: Initial VPS Setup, Project Folder Creation, and Project Upload

### 4.1 Connect to VPS

**Goal:** Access the remote Linux VPS server using SSH.

Command (from your local PC):

```bash
ssh -i PRIVATE_KEY_PATH VPS_USERNAME@VPS_IP
```

Example:

```bash
ssh -i C:\Users\Arna\.ssh\s20230204056 s20230204056@187.52.122.100
```

**Explanation**

`ssh` means Secure Shell. It allows you to control the VPS remotely.

- `PRIVATE_KEY_PATH` — your SSH private key location, e.g. `C:\Users\Arna\.ssh\s20230204056`. Do not use the `.pub` file — that is the public key.
- `VPS_USERNAME` — your assigned VPS username, e.g. `s20230204056`.
- `VPS_IP` — your server IP address, e.g. `187.52.122.100`.

#### Common SSH errors

**Error: `Warning: Identity file C:/path/to/privatekey not accessible`**

Cause: wrong private key path (e.g. `scp -i C:\path\to\privatekey` when that file doesn't exist).

Fix: find the real key location (e.g. `C:\Users\Arna\.ssh\s20230204056`) and use it:

```bash
ssh -i C:\Users\Arna\.ssh\s20230204056 s20230204056@187.52.122.100
```

### 4.2 Check current VPS location

After login:

```bash
pwd
```

Expected: `/home/s20230204056` — this is your home directory.

Check available files:

```bash
ls -la
```

`ls` lists files and folders; `-la` also shows hidden files.

### 4.3 Cleaning previous practice projects

If previous incomplete projects exist, remove them before starting a fresh deployment. Always check first:

```bash
ls -la
```

Then remove old projects:

```bash
rm -rf practice
rm -rf projects
```

`rm` = remove, `-r` = recursive (directories), `-f` = force.

**Warning:** this permanently deletes files. Before using `rm -rf`, always check `ls -la` first.

### 4.4 Create new project structure

For BookAPI deployment, the required structure is:

```
/home/s20230204056
└── bookapi
    ├── backend
    └── frontend
```

Create the folders:

```bash
mkdir -p ~/bookapi/backend
mkdir -p ~/bookapi/frontend
mkdir -p ~/bookapi/backend/uploads
```

`mkdir` creates a directory; `-p` creates parent directories automatically if they don't exist; `~` means your home directory (e.g. `~/bookapi` = `/home/s20230204056/bookapi`).

Check:

```bash
ls -la
ls -la ~/bookapi
```

Expected: `bookapi` at the top level, and `backend`/`frontend` inside it.

### 4.5 Upload project from local PC to VPS

Usually the developer gives you the project folder, e.g. `D:\demoVPS\bookapi` containing `backend/`, `frontend/`, `package.json`. Upload files using `scp`.

**Upload backend:**

```bash
scp -i PRIVATE_KEY_PATH -r backend/* USERNAME@VPS_IP:~/bookapi/backend/
```

Example:

```bash
scp -i C:\Users\Arna\.ssh\s20230204056 -r backend/* s20230204056@187.52.122.100:~/bookapi/backend/
```

**Upload frontend:**

```bash
scp -i PRIVATE_KEY_PATH -r frontend/* USERNAME@VPS_IP:~/bookapi/frontend/
```

Example:

```bash
scp -i C:\Users\Arna\.ssh\s20230204056 -r frontend/* s20230204056@187.52.122.100:~/bookapi/frontend/
```

#### Common SCP errors

**`Permission denied`** — wrong SSH key or username. Verify `ssh -i key username@IP` works first; if SSH works, SCP will usually work too.

**`No such file or directory`** — wrong local folder path (e.g. running the command from `D:\demoVPS` when it expects `backend` in the current directory). Check with `dir` (Windows) or `ls` (Linux) before running the command.

**`Warning: Identity file not accessible`** — wrong private key path. Use the real path (e.g. `C:\Users\Arna\.ssh\s20230204056`), not a placeholder like `C:\path\to\privatekey`.

### 4.6 Verify uploaded files

Back on the VPS:

```bash
cd ~/bookapi
ls -la
ls -la ~/bookapi/backend
ls -la ~/bookapi/frontend
```

Expected: `backend` and `frontend` folders present, each populated with the uploaded project files.

### Part 2 completed checklist

At the end of this part you should have:

```
/home/s20230204056/bookapi
├── backend
└── frontend
```

- ✅ VPS login
- ✅ Old projects removed
- ✅ New project folder created
- ✅ Backend folder created
- ✅ Frontend folder created
- ✅ Project uploaded from PC

**Next:** Part 3 — Backend deployment, Node setup, environment file, MySQL database creation, and first backend run (see [section 5](#5-deploying-to-an-ubuntu-vps) below).

---

## 5. Deploying to an Ubuntu VPS

### Step 1 — Install prerequisites on the VPS

```bash
sudo apt update
sudo apt install -y nodejs npm mysql-server
sudo npm install -g pm2
```

(Recommend installing Node via NodeSource/nvm for a recent LTS version.)

### Step 2 — Transfer project files via SCP

From your local machine:

```bash
scp -r bookapi/ user@your-vps-ip:/home/user/
```

### Step 3 — Configure MySQL on the VPS

```bash
sudo mysql
CREATE DATABASE bookapi;
CREATE USER 'bookapi_user'@'localhost' IDENTIFIED BY 'yourpassword';
GRANT ALL PRIVILEGES ON bookapi.* TO 'bookapi_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 4 — Configure environment variables

```bash
cd /home/user/bookapi/backend
cp .env.example .env
nano .env
```

Fill in `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.

```bash
cd /home/user/bookapi/frontend
cp .env.example .env.local
nano .env.local
```

Set `NEXT_PUBLIC_API_URL` to your domain or server IP, e.g. `http://your-domain.com/api` or `http://your-vps-ip:5000`.

### Step 5 — Install dependencies

```bash
cd /home/user/bookapi/backend
npm install --production

cd /home/user/bookapi/frontend
npm install
```

### Step 6 — Run backend with PM2

```bash
cd /home/user/bookapi/backend
pm2 start server.js --name bookapi-backend
pm2 save
pm2 startup
```

Useful PM2 commands:

```bash
pm2 status
pm2 logs bookapi-backend
pm2 restart bookapi-backend
```

### Step 7 — Build and run the frontend

```bash
cd /home/user/bookapi/frontend
npm run build
pm2 start npm --name bookapi-frontend -- start
pm2 save
```

This serves the frontend on port `3000`.

### Step 8 — Configure Nginx as a reverse proxy

Install Nginx:

```bash
sudo apt install -y nginx
```

Create `/etc/nginx/sites-available/bookapi`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/bookapi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

Your app is now available at `http://your-domain.com`.

### Step 9 — Open firewall ports (if using ufw)

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

(Ports 3000/5000 don't need to be publicly open once Nginx proxies to `localhost`.)

---

## 6. VPS Deployment Manual — Part 2: Backend Deployment, Environment Setup, MySQL Database Configuration, and First Backend Run

### 6.1 Enter backend directory

After uploading the project, your backend is located here:

```text
/home/s20230204056/bookapi/backend
```

Go inside and check files:

```bash
cd ~/bookapi/backend
ls -la
```

Expected: `package.json`, `server.js`, `routes`, `database`, `uploads`.

### 6.2 Install backend dependencies

```bash
npm install
```

`npm install` reads `package.json` and downloads all required Node.js packages (e.g. `express`, `cors`, `mysql`, `dotenv`). After installation, a new `node_modules` folder appears.

#### Common errors

**`npm: command not found`** — Node.js is not installed. Check with `node -v` and `npm -v`; if missing, install Node.js.

**`npm ERR! permission denied`** — wrong folder permission. Check `ls -la` and make sure you are inside your own directory (`/home/s20230204056/bookapi/backend`).

### 6.3 Create environment configuration file

The backend needs private configuration (database username, password, port number) that shouldn't be written directly in code — this is stored in `.env`.

Create it:

```bash
nano ~/bookapi/.env
```

Contents:

```env
PORT=5056
DB_HOST=127.0.0.1
DB_PORT=3307
DB_USER=s20230204056
DB_PASSWORD=mypassword
DB_NAME=s20230204056
```

**Explanation:**

- `PORT` — the backend application port. Your Express server will run on `http://localhost:5056`.
- `DB_HOST=127.0.0.1` — MySQL is running on the same VPS.
- `DB_PORT=3307` — this is the MySQL Docker exposed port. Do not randomly change it; your backend must match the MySQL port.
- `DB_USER` — the database user created later.
- `DB_PASSWORD` — password of that database user.
- `DB_NAME` — the database name.

Save inside nano: `Ctrl + O`, `Enter`, then exit with `Ctrl + X`.

### 6.4 Copy `.env` into the backend folder

**Problem:** if `.env` is created at `~/bookapi/.env` but the backend is started from `~/bookapi/backend`, `require('dotenv').config()` looks for `.env` in the *current* folder — so the backend can't find it.

**Solution:** copy it into the backend folder:

```bash
cp ~/bookapi/.env ~/bookapi/backend/.env
ls -la ~/bookapi/backend
```

You should see `.env`, `server.js`, `package.json`.

#### Common error

```text
Access denied for user ''@'localhost' (using password: NO)
```

Meaning: the backend is trying to connect without a username/password because `.env` was not loaded. Fix: copy `.env` as above, then restart the backend.

### 6.5 Set up the MySQL database

If MySQL is running in Docker, enter the MySQL container:

```bash
sudo docker exec -it mysql-database mysql -uroot -prootpass
```

- `docker exec` — runs a command inside a Docker container.
- `mysql-database` — the MySQL container name.
- `-u root` / `-p rootpass` — login as MySQL root user with the root password.

Inside MySQL, create the database:

```sql
CREATE DATABASE s20230204056;
```

Create the database user (`%` allows connection from any host):

```sql
CREATE USER 's20230204056'@'%' IDENTIFIED BY 'mypassword';
```

Grant privileges (create/insert/update/delete/read tables in that database):

```sql
GRANT ALL PRIVILEGES ON s20230204056.* TO 's20230204056'@'%';
```

Refresh privileges and exit:

```sql
FLUSH PRIVILEGES;
EXIT;
```

#### Common database errors

**`Access denied for user`** — wrong password/username, or the database user wasn't created. Check with `SELECT user FROM mysql.user;`.

**`Unknown database`** — the database doesn't exist. Create it again with `CREATE DATABASE database_name;`.

### 6.6 First backend run

```bash
cd ~/bookapi/backend
node server.js
```

Successful output:

```text
Backend server running on port 5056
```

### 6.7 Test the backend API

From another VPS terminal:

```bash
curl http://127.0.0.1:5056/api/health
```

Expected:

```json
{
 "status": "ok",
 "message": "Backend is running"
}
```

#### Common backend errors

**`EADDRINUSE address already in use port 5000`** — another application is already using that port. Change `PORT` in `.env` (e.g. from `5000` to `5056`) and restart with `node server.js`.

**Important:** do not change `DB_PORT=3307` unless you also change the MySQL Docker port — the application port and database port are different.

### Part 2 (backend) completed checklist

- ✅ Backend uploaded
- ✅ Node packages installed
- ✅ `.env` created
- ✅ `.env` copied to backend
- ✅ MySQL database created
- ✅ MySQL user created
- ✅ Permission granted
- ✅ Backend connected with database
- ✅ API tested successfully

**Next:** PM2 process management, frontend deployment, build, and running both services permanently — see [section 7](#7-vps-deployment-manual--part-3-pm2-process-management-frontend-deployment-and-running-services-permanently) below.

---

## 7. VPS Deployment Manual — Part 3: PM2 Process Management, Frontend Deployment, and Running Services Permanently

### 7.1 Why PM2 is required

**Problem:** when you run `node server.js` directly, the backend only runs while that terminal session is active. If you close the SSH connection, restart the VPS, or log out, the backend stops.

**Solution:** use PM2 — a process manager for Node.js applications. It keeps your application running in the background, automatically restarts it after a crash, and restarts it after a VPS reboot.

### 7.2 Install PM2

Check if PM2 already exists:

```bash
pm2 -v
```

If a version appears (e.g. `5.4.0`), PM2 is already installed. If not:

```bash
sudo npm install -g pm2
```

#### Common error

**`pm2: command not found`** — PM2 is not installed globally. Fix: `sudo npm install -g pm2`.

### 7.3 Start backend with PM2

```bash
cd ~/bookapi/backend
pm2 start server.js --name backend-s20230204056
```

- `pm2 start` — starts an application.
- `server.js` — the main backend file.
- `--name backend-s20230204056` — a custom name for managing the process.

Check:

```bash
pm2 status
```

Expected:

```text
┌────┬────────────────────────────┬────────┐
│ id │ name                       │ status │
├────┼────────────────────────────┼────────┤
│ 0  │ backend-s20230204056       │ online │
└────┴────────────────────────────┴────────┘
```

### 7.4 Save PM2 configuration

Without saving, PM2 forgets applications after a reboot:

```bash
pm2 save
```

Expected: `[PM2] Saving current process list`.

### 7.5 Enable PM2 after server restart

```bash
pm2 startup
```

PM2 will print a command, e.g.:

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u username --hp /home/username
```

Copy and run that command, then run `pm2 save` again.

### 7.6 PM2 common commands

```bash
pm2 status                              # show running applications
pm2 logs backend-s20230204056           # view logs
pm2 restart backend-s20230204056        # restart application
pm2 stop backend-s20230204056           # stop application
pm2 delete backend-s20230204056         # remove application from PM2
```

### 7.7 Frontend deployment

With the backend permanent, deploy the frontend next:

```bash
cd ~/bookapi/frontend
ls -la
```

Expected: `package.json`, `pages` or `app`, `next.config.js`.

### 7.8 Install frontend dependencies

```bash
npm install
```

Downloads frontend packages from `package.json` and creates `node_modules`.

#### Common error

**`npm ERR!`** — remove old modules and reinstall:

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### 7.9 Build frontend

```bash
npm run build
```

Converts development code into optimized production files. For Next.js, a successful build produces a `.next` folder.

#### Common build error

**`Module not found`** — a package is missing. Fix: `npm install`, or install the missing package specifically.

### 7.10 Test frontend manually

```bash
npm start -- -p 3066
```

Next.js normally uses port `3000`; here we use `3066` because the VPS is shared and ports may conflict.

Expected: `Ready on http://localhost:3066`.

Test from the VPS:

```bash
curl http://127.0.0.1:3066
```

Expected: HTML output, e.g. `<h1>Book Management System</h1>`.

### 7.11 Run frontend permanently with PM2

Stop the manual server with `Ctrl + C`, then start it with PM2:

```bash
pm2 start npm --name frontend-s20230204056 -- start -- -p 3066
```

- `pm2 start npm` — runs an npm command through PM2.
- `--name frontend-s20230204056` — frontend process name.
- `-- -p 3066` — passes the port argument to Next.js.

Check:

```bash
pm2 status
```

Expected:

```text
backend-s20230204056     online
frontend-s20230204056    online
```

Save:

```bash
pm2 save
```

### 7.12 Final service structure after Part 3

```text
/home/s20230204056/bookapi
├── backend
│   ├── server.js
│   └── .env
└── frontend
    └── (Next.js app)
```

Running services (PM2):

```text
backend-s20230204056     Port 5056
frontend-s20230204056    Port 3066
```

### Part 3 completed checklist

- ✅ PM2 installed
- ✅ Backend running with PM2
- ✅ PM2 save completed
- ✅ Frontend dependencies installed
- ✅ Frontend built
- ✅ Frontend tested
- ✅ Frontend running with PM2
- ✅ Both services online permanently

**Next:** Nginx reverse proxy, domain mapping, Windows hosts setup, routing errors, and final browser testing — including fixes for `404 Route not found`, `ERR_TOO_MANY_REDIRECTS`, hosts file permission problems, and Nginx proxy path issues (see [section 8](#8-vps-deployment-manual--part-4-nginx-reverse-proxy-domain-mapping-hosts-file-setup-routing-problems-and-final-testing) below).

---

## 8. VPS Deployment Manual — Part 4: Nginx Reverse Proxy, Domain Mapping, Hosts File Setup, Routing Problems, and Final Testing

### 8.1 Why Nginx is required

At this stage the application runs on separate ports — backend on `5056`, frontend on `3066` — reachable only as `http://SERVER_IP:5056` and `http://SERVER_IP:3066`. Users shouldn't have to access different ports. Nginx works as a reverse proxy:

```text
Browser
  |
Nginx (Port 80)
  |
  ├── Frontend (3066)
  └── Backend  (5056)
```

### 8.2 Check Nginx installation

```bash
nginx -v
```

Example: `nginx version: nginx/1.24.0`. If missing:

```bash
sudo apt update
sudo apt install nginx -y
```

### 8.3 Nginx folder structure

```text
/etc/nginx/
├── sites-available   # configuration files
└── sites-enabled     # active configurations (symlinks)
```

`sites-available` contains config files, e.g. `/etc/nginx/sites-available/s20230204056.conf`. Nginx only loads files from `sites-enabled/`, so we create a symbolic link from there.

### 8.4 Create Nginx configuration

```bash
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

**Explanation:**

- `server { }` — defines one website configuration.
- `listen 80;` — Nginx listens on the normal HTTP port, so the browser doesn't need `:80`.
- `server_name s20230204056.test;` — the hostname we'll create locally.

### 8.5 Backend proxy configuration

`location /s20230204056/vps-demo/api/` — when the browser requests `/s20230204056/vps-demo/api/health`, Nginx sends it to the backend.

`proxy_pass http://127.0.0.1:5056/api/;` — the final backend request becomes `http://127.0.0.1:5056/api/health`, matching Express's `app.use('/api/health', healthRoutes)` and `router.get('/')`, giving the final route `/api/health/`.

### 8.6 Frontend proxy configuration

`location /s20230204056/vps-demo/` — a browser request to `/s20230204056/vps-demo/` goes to `http://127.0.0.1:3066/`.

### 8.7 Enable the Nginx configuration

```bash
sudo ln -s /etc/nginx/sites-available/s20230204056.conf /etc/nginx/sites-enabled/
```

**Possible error:** `ln: failed to create symbolic link: File exists` — the link already exists, no problem. Check with `ls -la /etc/nginx/sites-enabled/`.

### 8.8 Test Nginx configuration

```bash
sudo nginx -t
```

Successful: `syntax is ok` / `test is successful`.

**Possible warning:** `conflicting server name "187.52.122.100"` — means another user's Nginx configuration uses the same server IP; usually just a warning. If the syntax test succeeds, continue.

### 8.9 Reload Nginx

After every config change:

```bash
sudo systemctl reload nginx
```

### 8.10 Test backend through Nginx

Before browser testing, test from the VPS:

```bash
curl -H "Host: s20230204056.test" http://127.0.0.1/s20230204056/vps-demo/api/health
```

Expected:

```json
{
"status":"ok",
"message":"Backend is running"
}
```

### 8.11 Routing error: `Route not found`

```json
{"error":"Route not found"}
```

**Cause:** wrong `proxy_pass` path. Wrong:

```nginx
proxy_pass http://127.0.0.1:5056/;
```

This strips `/api`, so the backend receives `/health` instead of the required `/api/health`.

**Fix:**

```nginx
proxy_pass http://127.0.0.1:5056/api/;
```

Then:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 8.12 Windows hosts file setup

`s20230204056.test` is not a real internet domain — your computer doesn't know it maps to `187.52.122.100`, so you add the mapping manually.

Required line:

```text
187.52.122.100 s20230204056.test
```

Location: `C:\Windows\System32\drivers\etc\hosts`.

### 8.13 Hosts file permission problem

**Error:** `Access denied`, even in administrator mode. `Add-Content` and `attrib -r` do **not** work around this.

**Final working solution** (admin PowerShell):

```powershell
# Step 1: take ownership
takeown /f C:\Windows\System32\drivers\etc\hosts
# Success: "SUCCESS: file now owned by user"

# Step 2: give permission
icacls C:\Windows\System32\drivers\etc\hosts /grant Administrators:F

# Step 3: rename old hosts file
ren C:\Windows\System32\drivers\etc\hosts hosts.old
```

Then create a new file at `C:\Users\Public\hosts` with contents:

```text
187.52.122.100 s20230204056.test
```

And copy it into place:

```powershell
copy C:\Users\Public\hosts C:\Windows\System32\drivers\etc\hosts
```

### 8.14 Refresh DNS

```powershell
ipconfig /flushdns
```

### 8.15 Test the domain

```powershell
ping s20230204056.test
```

Successful output: `Pinging s20230204056.test [187.52.122.100]`.

### 8.16 Final browser testing

**Frontend:**

```text
http://s20230204056.test/s20230204056/vps-demo/
```

Expected: the Book Management System page.

**Backend API:**

```text
http://s20230204056.test/s20230204056/vps-demo/api/health
```

Expected:

```json
{
"status":"ok",
"message":"Backend is running"
}
```

### Part 4 completed checklist

- ✅ Nginx installed
- ✅ Nginx config created
- ✅ Reverse proxy configured
- ✅ Backend routing fixed
- ✅ Frontend routing configured
- ✅ Hosts mapping created
- ✅ DNS refreshed
- ✅ Domain tested

### Remaining troubleshooting guide

**Error: 404 Page Not Found** — check the config file:

```bash
cat /etc/nginx/sites-available/s20230204056.conf
```

Check the `location` path, the `proxy_pass` path, and trailing `/`.

**Error: Too Many Redirects** — usually a missing trailing slash. Wrong:

```nginx
proxy_pass http://127.0.0.1:3066;
```

Correct:

```nginx
proxy_pass http://127.0.0.1:3066/;
```

Then clear browser cookies.

**Error: backend works directly but not through Nginx** — compare:

```bash
# Direct
curl http://127.0.0.1:5056/api/health

# Through Nginx
curl -H "Host: s20230204056.test" http://127.0.0.1/s20230204056/vps-demo/api/health
```

If the first works and the second fails, the problem is the Nginx path.

---

This completes the full deployment process — sections 3–8 (Parts 1–4) together form a complete VPS deployment reference, from SSH login through Nginx and domain testing.

---

## 9. Production Commands Summary

| Task                     | Command                                      |
|--------------------------|-----------------------------------------------|
| Install backend deps     | `cd backend && npm install`                  |
| Install frontend deps    | `cd frontend && npm install`                 |
| Build frontend           | `cd frontend && npm run build`               |
| Start backend (PM2)      | `pm2 start server.js --name bookapi-backend` |
| Start frontend (PM2)     | `pm2 start npm --name bookapi-frontend -- start` |
| View PM2 processes       | `pm2 status`                                 |
| View logs                | `pm2 logs`                                   |
| Restart after code change| `pm2 restart bookapi-backend`                |

## API Endpoints

| Method | Endpoint          | Description         |
|--------|-------------------|----------------------|
| GET    | `/api/health`     | Health check         |
| GET    | `/api/books`      | List all books (supports `?search=`) |
| POST   | `/api/books`      | Add a new book (`{ title, author }`) |
| DELETE | `/api/books/:id`  | Delete a book by id   |

## Notes

This project is intentionally minimal — no authentication, no Docker, no payment/AI features — to keep focus on the core VPS deployment workflow: SCP transfer, npm install, environment variables, MySQL setup, PM2, and Nginx reverse proxy.
