---
description: Analiza los cambios, hace git add, genera un commit y pide confirmación al usuario
---

# Commit

Vas a preparar y crear un commit de Git siguiendo estos pasos, en orden:

1. **Verifica el estado del repositorio**
   - Ejecuta `git status` para ver si hay archivos modificados, nuevos o eliminados.
   - Si **no hay ningún cambio** (working tree limpio), informa al usuario: "No hay cambios por commitear" y **detente aquí**. No continúes con los siguientes pasos.

2. **Analiza los cambios**
   - Ejecuta `git diff` (y `git diff --staged` si aplica) para entender qué se modificó, agregó o eliminó.
   - Identifica el propósito general de los cambios (qué archivos, qué tipo de cambio: feature, fix, refactor, docs, etc.).

3. **Agrega los cambios**
   - Ejecuta `git add .` para preparar todos los archivos modificados.

4. **Genera un mensaje de commit**
   - Basado en el análisis del paso 2, redacta un mensaje de commit claro y conciso, siguiendo buenas prácticas (idealmente estilo *Conventional Commits*: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, etc.).
   - El mensaje debe explicar el "qué" y, si es relevante, el "por qué" del cambio.

5. **Pide confirmación al usuario**
   - Muestra el mensaje de commit propuesto y pregunta explícitamente al usuario si desea:
     - Confirmar y crear el commit tal cual.
     - Editar el mensaje antes de confirmar.
     - Cancelar la operación.
   - **No ejecutes `git commit` hasta recibir confirmación explícita del usuario.**

6. **Crea el commit**
   - Solo si el usuario confirma, ejecuta `git commit -m "<mensaje generado o editado>"`.
   - Muestra el resultado del commit (hash y resumen) al usuario.

## Notas
- Nunca hagas `git push` como parte de este comando, a menos que el usuario lo pida explícitamente.
- Si hay archivos que parecen no deberían commitearse (ej. `.env`, credenciales, archivos temporales), adviértelo al usuario antes de continuar.
- Si el repositorio no está inicializado o no es un repo de Git, informa el error claramente en vez de intentar continuar.
