# Asescon Backend

Backend desarrollado en **NestJS** para el sistema Asescon, encargado de la lógica de negocio, autenticación, gestión de contenido y exposición de APIs para el frontend en Next.js.

---

## 🚀 Tecnologías principales

| Tecnología | Uso |
|---|---|
| NestJS | Arquitectura modular |
| TypeScript | Tipado estricto |
| Prisma ORM | Acceso a base de datos |
| PostgreSQL | Base de datos relacional |
| JWT + Passport | Autenticación segura |
| Cloudinary | Gestión de imágenes |
| Bcrypt | Hash de contraseñas |
| Multer | Manejo de archivos |
| Class Validator | Validación mediante DTOs |

---

## 📦 Arquitectura del proyecto

El backend está estructurado bajo una arquitectura modular típica de NestJS:

```text
src/
├── auth/           # Autenticación JWT + Passport
├── users/          # Gestión de usuarios y roles
├── post/           # Módulo de blog
├── servicio/       # Módulo de servicios
├── intranet/       # Sistema interno de navegación
├── contacto/       # Registro de leads
├── prisma/         # Prisma Service (acceso a BD)
└── common/         # Guards, DTOs y utilidades compartidas
```
## Cada módulo sigue la estructura:

```text
módulo/
├── módulo.controller.ts   # API layer
├── módulo.service.ts      # Business logic
├── módulo.module.ts       # Declaración del módulo
├── dto/                   # Validación de entrada
└── guards/                # Seguridad JWT / roles
```

---

## ⚙️ Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/asescon-backend.git

# Entrar al proyecto
cd asescon-backend

# Instalar dependencias
npm install
# o
pnpm install
```

---

## 🔐 Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/asescon

# JWT
JWT_SECRET=tu_secreto_jwt

# Cloudinary
CLOUDINARY_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

---

## 🗃️ Base de datos

```bash
# Ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Ver base de datos en Prisma Studio (opcional)
npx prisma studio
```

**Modelos principales:**

| Modelo | Descripción |
|---|---|
| `User` | Usuarios del sistema |
| `Post` | Entradas del blog |
| `Service` | Servicios ofrecidos |
| `IntranetLink` | Links del panel interno |
| `Contacto` | Leads y formularios |

---

## ▶️ Ejecución en desarrollo

```bash
npm run start:dev
# o
pnpm run start:dev
```

El servidor correrá en: [http://localhost:3001](http://localhost:3001)

---

## 🏗️ Build de producción

```bash
npm run build
npm run start:prod
```

---

## 📡 Endpoints principales

| Prefijo | Módulo |
|---|---|
| `/auth` | Autenticación (login, registro) |
| `/post` | Blog (CRUD de posts) |
| `/servicio` | Servicios |
| `/intranet` | Sistema interno |
| `/contacto` | Leads y contactos |

---

## 🧠 Funcionalidades principales

### 🔑 Autenticación y usuarios
- Registro e inicio de sesión
- JWT para sesiones seguras
- Protección de rutas con `AuthGuard`
- Manejo de roles: `ADMIN` / `USER` / `OWNER`

### 📝 Blog (Posts)
- CRUD completo de posts
- Subida de imágenes a Cloudinary
- Slug automático con `slugify`
- Sistema de publicación (`published` / `draft`)
- Cálculo de tiempo de lectura
- Filtros administrativos (search, category, published)

### 🧩 Servicios
- CRUD de servicios
- Sistema de recomendación por tipo de negocio y pain points
- Gestión de imágenes
- Ordenamiento y visibilidad pública

### 🏢 Intranet
- Gestión de links internos
- Control de visibilidad por rol
- Endpoints públicos y administrativos
- Orden de navegación configurable

### 📩 Contactos (Leads)
- Registro de formularios de contacto
- Gestión de estado del lead:

  | Estado | Descripción |
  |---|---|
  | `PENDING` | Recibido, sin gestionar |
  | `CONFIRMED` | Contacto confirmado |
  | `COMPLETED` | Proceso finalizado |
  | `CANCELLED` | Cancelado |

- Panel administrativo para seguimiento
- Persistencia en PostgreSQL

---

## 🛡️ Seguridad

- ✅ JWT Strategy con Passport
- ✅ Guards por autenticación (`AuthGuard`)
- ✅ Validación de DTOs con `class-validator`
- ✅ Sanitización de datos de entrada
- ✅ Control de acceso por roles (base inicial implementada)

---

## ☁️ Cloudinary

- Almacenamiento de imágenes externo
- Subida desde backend usando `Multer`
- Eliminación automática de imágenes antiguas al actualizar o borrar entidades

---

## ⭐ Características técnicas destacadas

- Arquitectura modular y escalable
- Separación clara entre `controller` / `service` / `dto`
- Manejo robusto de errores con excepciones HTTP de NestJS
- Integración completa con frontend Next.js
- Optimización de queries con Prisma `select` / `include`
- Filtros avanzados en endpoints administrativos

---

## 🔗 Frontend relacionado

> Este backend está diseñado para trabajar en conjunto con el frontend en Next.js.
> 📁 Repositorio frontend: [`/asescon-frontend`](../asescon-frontend)

---

## 👨‍💻 Autor

Desarrollado por **[Nahum Salazar Levano](https://github.com/Nahum-SL)**

---

## 📌 Observaciones

> Este backend está diseñado para soportar un sistema administrativo completo con enfoque en **escalabilidad**, **separación de responsabilidades** y **facilidad de mantenimiento**.