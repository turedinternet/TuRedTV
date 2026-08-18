# TuRed TV - Portal de Descarga

Portal de descarga oficial de la aplicación **TuRed TV** para Smart TV, Fire TV Stick, Android TV y dispositivos móviles.

## Características

- Portal de descarga pública con enlace permanente
- Panel de administración protegido con Firebase Authentication
- Código Downloader fijo para Smart TV / Firestick (`549210`)
- Código QR de descarga rápida
- Diseño responsive con glassmorphism oscuro
- Compatible con GitHub Pages (zero-build, vanilla JS)

## Tecnologías

- HTML5 / CSS3 / JavaScript ES6 (vanilla)
- Firebase SDK vía CDN (Auth, Firestore)
- Paleta de marca: `#007cc3` `#1f1a17` `#3c9bd1` `#5da2d1` `#37302d` `#808080`

## Estructura

```
TuRedTV/
├── index.html          # Portal público de descarga
├── admin.html          # Panel de administración (Firebase Auth)
├── icon.png            # Logo de la aplicación
├── css/
│   └── styles.css      # Design system y estilos
├── js/
│   ├── firebase-config.js  # Configuración Firebase y persistencia
│   ├── app.js              # Lógica del portal público
│   └── admin.js            # Lógica del panel admin
└── data/
    └── app-config.json     # Configuración estática de la app
```

## Despliegue en GitHub Pages

1. Subir los archivos de `TuRedTV/` a la rama `main` o `gh-pages`
2. En GitHub → Settings → Pages → Source: `main` / carpeta `/ (root)` o `TuRedTV/`
3. El sitio estará disponible en `https://armando.github.io/TvTuRed/`

## Panel de Administración

1. Acceder a `admin.html`
2. Iniciar sesión con una cuenta de Firebase Authentication
3. Actualizar versión, changelog y metadatos de la app
4. Subir nuevo APK a GitHub Releases y escribir la URL de descarga en el panel de admin

## URL de Descarga

La URL se almacena en Firestore y se edita desde el panel de admin. No está hardcodeada en ningún archivo del proyecto.

## Licencia

[MIT](LICENSE)
