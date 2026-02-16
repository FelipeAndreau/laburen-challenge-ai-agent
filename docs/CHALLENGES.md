# Desafíos Encontrados y Soluciones

## 1. Meta Business Verification

**Problema:** Meta bloqueaba la verificación de la cuenta business por "dispositivo no habitual", impidiendo el acceso a la WhatsApp Business API.

**Solución:** Esperar 24-48hs e intentar desde un dispositivo habitual. También ayudó agregar un método de pago a la cuenta.

## 2. Evolution API (descartado)

**Problema:** Bug conocido en Evolution API v2.1.1 y v2.2.3 — no generaba el QR code necesario para vincular WhatsApp, haciendo imposible la conexión.

**Solución:** Se descartó Evolution API y se optó por usar Meta WhatsApp Cloud API directamente a través de Chatwoot, que resultó más estable y es el método oficial.

## 3. Token de acceso temporal

**Problema:** El token temporal de Meta para la WhatsApp Cloud API expira en ~24 horas, causando que el bot dejara de funcionar silenciosamente.

**Solución:** Crear un System User en Meta Business Suite y generar un token permanente en lugar del temporal de desarrollo.

## 4. Número no en allowed list

**Problema:** En modo de desarrollo, el bot solo puede responder a números previamente autorizados en la lista "Para" de Meta.

**Solución:** Agregar los números de prueba en la configuración "Para" de la app de Meta, o publicar la app para producción.

## 5. Bot falla en segundo mensaje

**Problema:** El bot de Laburen respondía correctamente al primer mensaje pero fallaba en los siguientes, generando un error silencioso en el agent bot.

**Causa:** El token de acceso había expirado entre mensajes, causando un error de autenticación que no se mostraba como error visible.

**Solución:** Monitorear la expiración del token y renovarlo proactivamente.

## 6. Cloudflare Workers — Subdominio requerido

**Problema:** El primer deploy falló con error `code: 10063` porque la cuenta de Cloudflare era nueva y no tenía un subdominio `workers.dev` configurado.

**Solución:** Visitar el dashboard de Cloudflare → Workers & Pages para que se cree automáticamente el subdominio al acceder por primera vez.

## 7. TypeScript compilation — Worker types

**Problema:** TypeScript no reconocía los tipos de Cloudflare Workers (`DurableObject`, `ExecutionContext`, `D1Database`) al compilar.

**Solución:** Usar `worker-configuration.d.ts` generado por `npx wrangler types` que incluye todas las definiciones del runtime de Cloudflare Workers (~11K líneas).
