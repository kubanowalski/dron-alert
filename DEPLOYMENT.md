# Wdrożenie DronAlert na AWS

## Przegląd Opcji Wdrożenia

Masz kilka możliwości wdrożenia aplikacji Next.js na AWS:

1. **AWS Amplify** ⭐ (Najłatwiejsze - Rekomendowane)
2. **AWS App Runner** (Średni poziom trudności)
3. **AWS EC2 + Nginx** (Większa kontrola, więcej konfiguracji)
4. **AWS ECS/Fargate** (Dla aplikacji kontenerowych)

---

## 🚀 Opcja 1: AWS Amplify (Rekomendowane)

### Zalety
- ✅ Najprostsze wdrożenie (kilka kliknięć)
- ✅ Automatyczne CI/CD z GitHub
- ✅ Darmowy SSL certificate
- ✅ Automatyczne skalowanie
- ✅ Free tier: 1000 build minutes/miesiąc

### Koszt
- Build minutes: $0.01/min (free tier: 1000 min/miesiąc)
- Hosting: $0.15/GB (free tier: 15 GB/miesiąc)

### Instrukcja Krok po Kroku

#### 1. Przygotowanie Repozytorium GitHub

```bash
# Upewnij się, że jesteś w katalogu projektu
cd /Users/kubanowalski/Documents/Antigravity/dron-alert

# Sprawdź status
git status

# Dodaj wszystkie pliki
git add .

# Commit
git commit -m "Initial commit - DronAlert MVP"

# Utwórz repo na GitHubie (przez stronę github.com)
# następnie:
git remote add origin https://github.com/TWOJA_NAZWA/dron-alert.git
git branch -M main
git push -u origin main
```

#### 2. Konfiguracja AWS Amplify

1. **Zaloguj się do AWS Console**
   - Przejdź na: https://console.aws.amazon.com/amplify/

2. **Utwórz Nową Aplikację**
   - Kliknij **"New app"** → **"Host web app"**
   
3. **Połącz z GitHub**
   - Wybierz **GitHub**
   - Autoryzuj AWS Amplify
   - Wybierz repozytorium `dron-alert`
   - Wybierz branch `main`

4. **Skonfiguruj Build Settings**
   
   Amplify automatycznie wykryje Next.js. Sprawdź czy config wygląda tak:
   
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
         - .next/cache/**/*
   ```

5. **Dodaj Zmienne Środowiskowe**
   - W sekcji "Environment variables" dodaj:
     - **Key**: `DATABASE_URL`
     - **Value**: Twój PostgreSQL connection string
   - ⚠️ **WAŻNE**: Nie używaj zmiennej z Prisma Accelerate API key w production bez dodatkowych zabezpieczeń

6. **Zapisz i Wdróż**
   - Kliknij **"Save and deploy"**
   - Amplify automatycznie zbuduje i wdroży aplikację
   - Proces trwa ~5-10 minut

7. **Sprawdź Aplikację**
   - Po zakończeniu build, otrzymasz URL typu:
     `https://main.XXXXXX.amplifyapp.com`
   - Otwórz URL i przetestuj aplikację

#### 3. Konfiguracja Własnej Domeny (Opcjonalnie)

1. W Amplify Console → **Domain management**
2. Kliknij **"Add domain"**
3. Wprowadź swoją domenę (np. `dronalert.com`)
4. Amplify poda Ci DNS records do skonfigurowania u rejestratora domeny
5. Po weryfikacji, Amplify automatycznie skonfiguruje SSL

---

## 🔧 Opcja 2: AWS App Runner

### Zalety
- ✅ Kontenerowa aplikacja
- ✅ Automatyczne skalowanie
- ✅ Prostsze niż EC2

### Koszt
- ~$5-25/miesiąc w zależności od użycia

### Instrukcja

1. **Utwórz Dockerfile**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

2. **W AWS Console, przejdź do App Runner**
3. **Create Service**
   - Repository type: Container registry
   - Deployment settings: Automatic
4. **Konfiguruj zmienne środowiskowe**
   - Dodaj `DATABASE_URL`

---

## 🖥️ Opcja 3: AWS EC2 (Zaawansowane)

### Zalety
- ✅ Pełna kontrola
- ✅ Możliwość custom konfiguracji
- ❌ Więcej pracy konfiguracyjnej

### Koszt
- EC2 t3.micro: ~$8-10/miesiąc (lub Free Tier przez rok)

### Instrukcja Skrócona

#### 1. Uruchom EC2 Instance

1. W AWS Console → **EC2** → **Launch Instance**
2. Wybierz **Ubuntu Server 22.04 LTS**
3. Instance type: **t3.micro** (Free Tier eligible)
4. Konfiguruj Security Group:
   - SSH (port 22) - Twoje IP
   - HTTP (port 80) - 0.0.0.0/0
   - HTTPS (port 443) - 0.0.0.0/0
5. Utwórz lub wybierz key pair (.pem)
6. Launch instance

#### 2. Połącz się z Serwerem

```bash
chmod 400 twoj-klucz.pem
ssh -i "twoj-klucz.pem" ubuntu@<EC2-PUBLIC-IP>
```

#### 3. Zainstaluj Node.js i Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 4. Sklonuj Repozytorium i Zainstaluj

```bash
cd /home/ubuntu
git clone https://github.com/TWOJA_NAZWA/dron-alert.git
cd dron-alert

npm install
```

#### 5. Skonfiguruj Zmienne Środowiskowe

```bash
nano .env
```

Dodaj:
```
DATABASE_URL="your_postgresql_connection_string"
```

#### 6. Zbuduj Aplikację

```bash
npm run build
```

#### 7. Uruchom z PM2

```bash
pm2 start npm --name "dronalert" -- start
pm2 startup
pm2 save
```

#### 8. Skonfiguruj Nginx jako Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/dronalert
```

Dodaj:
```nginx
server {
    listen 80;
    server_name your_domain.com;  # lub EC2 public IP

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

Aktywuj konfigurację:
```bash
sudo ln -s /etc/nginx/sites-available/dronalert /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 9. (Opcjonalnie) Skonfiguruj SSL z Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your_domain.com
```

---

## 🔐 Najlepsze Praktyki Bezpieczeństwa

### 1. Zmienne Środowiskowe

❌ **NIE RÓB TEGO**:
```bash
# Hard-coded secrets w kodzie
const DATABASE_URL = "postgres://user:pass@host/db"
```

✅ **RÓB TO**:
```bash
# W .env (nigdy nie commituj)
DATABASE_URL="postgres://user:pass@host/db"

# W kodzie
const DATABASE_URL = process.env.DATABASE_URL
```

### 2. AWS Secrets Manager (Produkcja)

Dla produkcji, przechowuj secrets w AWS Secrets Manager:

```bash
# Utwórz secret
aws secretsmanager create-secret \
    --name dronalert/database \
    --secret-string '{"DATABASE_URL":"postgresql://..."}'
```

W aplikacji:
```javascript
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

const getSecret = async () => {
  const data = await secretsManager.getSecretValue({
    SecretId: 'dronalert/database'
  }).promise();
  return JSON.parse(data.SecretString);
};
```

### 3. Checklist Bezpieczeństwa

- ✅ `.env` w `.gitignore`
- ✅ `.env.example` z placeholder values
- ✅ Różne credentials dla dev/prod
- ✅ SSL/HTTPS w produkcji
- ✅ Regularne aktualizacje dependencies
- ✅ Security Groups ograniczone do niezbędnych portów

---

## 📊 Porównanie Opcji

| Funkcja | Amplify | App Runner | EC2 |
|---------|---------|------------|-----|
| Łatwość | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Koszt | $5-15/m | $10-25/m | $8-50/m |
| Kontrola | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Auto-scaling | ✅ | ✅ | ❌ (manual) |
| CI/CD | ✅ Auto | Partial | ❌ (manual) |

## 🎯 Rekomendacja

Dla projektu edukacyjnego i MVP:
1. **Start z AWS Amplify** - najszybsze wdrożenie
2. Jeśli potrzebujesz więcej kontroli → **App Runner**
3. Dla nauki DevOps → **EC2**

---

## 🆘 Troubleshooting

### Problem: Build fails na Amplify

**Rozwiązanie**: Sprawdź logi budowania. Najczęstsze przyczyny:
- Brak zmiennej `DATABASE_URL`
- Błędy w package.json
- Node version mismatch

### Problem: Cannot connect to database

**Rozwiązanie**: 
- Sprawdź czy database jest dostępny publicznie
- Sprawdź Security Groups
- Zweryfikuj connection string

### Problem: 502 Bad Gateway na EC2

**Rozwiązanie**:
- Sprawdź czy aplikacja działa: `pm2 status`
- Sprawdź logi: `pm2 logs dronalert`
- Restart: `pm2 restart dronalert`

---

## 📞 Wsparcie

W razie problemów:
1. Sprawdź logi aplikacji
2. Sprawdź CloudWatch Logs (dla Amplify/App Runner)
3. Sprawdź dokumentację AWS

---

**Powodzenia z wdrożeniem! 🚀**
