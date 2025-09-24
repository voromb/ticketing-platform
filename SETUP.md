# 🎫 Ticketing Platform - Setup Instructions

## 📦 **Archivos importantes a respaldar:**

### 📄 **Archivos .env (NO subir a GitHub):**
1. `docker/.env` - Configuración de Docker
2. `backend/user-service/.env` - Configuración del backend

### 🗄️ **Base de datos:**
- Backup en: `docker/bd_backup/`

---

## 🔧 **Crear backup de la base de datos:**
```bash
# Desde la carpeta docker/ 
docker exec ticketing-mongodb mongoexport --username admin --password admin123 --authenticationDatabase admin --db ticketing --collection events --out /events.json
docker exec ticketing-mongodb mongoexport --username admin --password admin123 --authenticationDatabase admin --db ticketing --collection users --out /users.json
docker cp ticketing-mongodb:/events.json ./bd_backup/
docker cp ticketing-mongodb:/users.json ./bd_backup/
```

---

## 🚀 **Setup en nuevo PC:**

### 1. **Clonar repositorio:**
```bash
git clone <tu-repo-url>
cd ticketing-platform
```

### 2. **Instalar dependencias:**
```bash
# Frontend
cd frontend/ticketing-app
npm install

# Backend  
cd backend/user-service
npm install
```

### 3. **Configurar archivos .env:**
```bash
# Copiar los archivos .env guardados a:
# - docker/.env
# - backend/user-service/.env
```

### 4. **Levantar servicios con Docker:**
```bash
cd docker
docker-compose up -d
```

### 5. **Restaurar base de datos:**
```bash
# Desde la carpeta docker/
docker cp ./bd_backup/events.json ticketing-mongodb:/events.json
docker cp ./bd_backup/users.json ticketing-mongodb:/users.json
docker exec ticketing-mongodb mongoimport --username admin --password admin123 --authenticationDatabase admin --db ticketing --collection events --file /events.json
docker exec ticketing-mongodb mongoimport --username admin --password admin123 --authenticationDatabase admin --db ticketing --collection users --file /users.json
```

### 6. **Iniciar aplicación:**
```bash
# Backend
cd backend/user-service
npm run dev

# Frontend (nueva terminal)
cd frontend/ticketing-app
npm start
```

---

## 🔑 **Credenciales por defecto:**

### MongoDB:
- Usuario: `admin`
- Password: `admin123`
- Database: `ticketing`
- Puerto: `27017`

### RabbitMQ:
- Usuario: `admin`  
- Password: `admin123`
- Puerto: `5672`
- Management UI: `http://localhost:15672`

---

## 🌐 **URLs y Puertos de la aplicación:**

### **Aplicación Principal:**
- **Frontend Angular:** `http://localhost:4200`
- **Backend API:** `http://localhost:3001`

### **Servicios de Infraestructura:**
- **MongoDB:** `localhost:27017`
- **RabbitMQ AMQP:** `localhost:5672`
- **RabbitMQ Management UI:** `http://localhost:15672`

### **Servicios Docker (si usas Docker):**
- **MongoDB Docker:** `localhost:27017`
- **RabbitMQ Docker:** `localhost:5672`
- **RabbitMQ Management Docker:** `http://localhost:15672`

### **Puertos de desarrollo alternativos:**
- **Frontend (si 4200 está ocupado):** `http://localhost:16674` (o el que asigne Angular)
- **Backend (alternativo):** `localhost:3000` (si cambias en .env)

---

## 🔍 **Verificar que los servicios estén corriendo:**

### **Comprobar puertos activos:**
```bash
# Windows
netstat -ano | findstr :4200    # Frontend
netstat -ano | findstr :3001    # Backend
netstat -ano | findstr :27017   # MongoDB
netstat -ano | findstr :5672    # RabbitMQ
netstat -ano | findstr :15672   # RabbitMQ Management

# O usar este comando para ver todos:
netstat -ano | findstr ":4200 :3001 :27017 :5672 :15672"
```

### **URLs para verificar servicios:**
- **Frontend:** http://localhost:4200 (debería mostrar la app)
- **Backend Health:** http://localhost:3001/api/auth/profile (con token)
- **MongoDB:** Usar MongoDB Compass con `mongodb://admin:admin123@localhost:27017`
- **RabbitMQ:** http://localhost:15672 (admin/admin123)