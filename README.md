# fincatix.es

La página de presentación de FincatiX. Es estática: `index.html`, `styles.css`,
`main.js` y `favicon.svg`, sin nada que compilar.

## Verla en local

Abra `index.html` en el navegador, o sírvala desde esta carpeta:

```
python3 -m http.server 4321
```

y entre en http://localhost:4321.

## Publicarla en GitHub Pages

1. Suba esta carpeta a la raíz de un repositorio de GitHub.
2. En el repositorio: **Settings → Pages → Build and deployment**, origen
   «Deploy from a branch», rama `main`, carpeta `/ (root)`.
3. El fichero `CNAME` ya dice `fincatix.es`. En el proveedor del dominio:
   - Cuatro registros **A** para `fincatix.es`: `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153` y `185.199.111.153`.
   - Un registro **CNAME** para `www` que apunte a `<su-usuario>.github.io`.
4. Cuando GitHub compruebe el dominio, marque **Enforce HTTPS**.

`fincatix.com` no puede ir en el mismo repositorio: GitHub Pages admite un solo
dominio propio. Lo sencillo es redirigirlo a `https://fincatix.es` desde el
proveedor del dominio.

## Antes de publicar

- El correo de contacto es `hola@fincatix.es` en cuatro sitios del `index.html`
  (búsquelo y cámbielo si es otro). Tiene que existir antes de publicar.

## Las imágenes

`og.png` (la que sale al compartir el enlace, 1200 × 630) y `apple-touch-icon.png`
(el icono de la pantalla de inicio del móvil, 180 × 180) se generan desde
`fuentes/og.html` y `fuentes/icono.html` con Chrome sin ventana. Si cambia el
titular o la marca, se cambia el HTML y se vuelven a sacar:

```
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=6000 --window-size=1200,630 --screenshot=og.png "file://$PWD/fuentes/og.html"
"$CH" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=180,180 --screenshot=apple-touch-icon.png "file://$PWD/fuentes/icono.html"
```

Chrome a veces no se cierra solo al terminar: cuando aparezca el PNG, Ctrl+C.
