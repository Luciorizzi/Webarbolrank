# KILO Admin MVP

El panel vive en `/admin` y usa Supabase Auth con email y contraseña. Una sesión válida no alcanza: el `user_id` también debe existir en `public.admin_users`. Las consultas y mutaciones administrativas se ejecutan en el servidor con `service_role`; esa clave nunca debe usar prefijo `NEXT_PUBLIC_` ni importarse desde componentes cliente.

## Crear el primer administrador

1. En Supabase Studio local (`http://127.0.0.1:54323`) o en el panel del proyecto, abrir **Authentication → Users** y crear un usuario con email/password.
2. Copiar el UUID del usuario creado.
3. Ejecutar en SQL Editor, reemplazando el UUID:

```sql
insert into public.admin_users (user_id)
values ('UUID-DEL-USUARIO');
```

4. Abrir `/admin/login` e iniciar sesión con esas credenciales.

Para revocar el acceso sin borrar la cuenta Auth:

```sql
delete from public.admin_users where user_id = 'UUID-DEL-USUARIO';
```

No se almacenan contraseñas en tablas públicas. No existe una acción administrativa para cambiar el estado de una donación; ese estado sigue siendo propiedad exclusiva del webhook de Mercado Pago.

