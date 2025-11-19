module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

4. Commit changes

---

## **PARTE 2: CONFIGURAR GOOGLE APPS SCRIPT**

### Paso 2.1: Preparar Google Sheets

1. Ve a [sheets.google.com](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala: **"Sistema de Asistencia - DB"**

### Paso 2.2: Crear las Hojas

Renombra y crea las siguientes hojas (pestañas abajo):

**Hoja 1: "Personal"**
- Haz clic derecho en "Hoja 1" → Cambiar nombre → "Personal"
- Agrega estos encabezados en la primera fila:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| ID | Nombre | Apellido | Ciudad | Cargo | SupervisorUser | Estado |

**Hoja 2: "Usuarios"**
- Clic en el **+** para agregar nueva hoja
- Nómbrala "Usuarios"
- Encabezados:

| A | B | C | D | E |
|---|---|---|---|---|
| Usuario | Password | Ciudad | Rol | Activo |

**Hoja 3: "Asistencias"**
- Agregar otra hoja nueva
- Nómbrala "Asistencias"
- Encabezados:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| ID_Registro | ID_Personal | Nombre_Completo | Ciudad | Fecha | Hora_Entrada | Hora_Salida | Tipo_Jornada | Horas_Trabajadas | Registrado_Por | Timestamp |

### Paso 2.3: Cargar Datos de Prueba

**En la hoja "Personal"**, agrega estos datos (desde la fila 2):
```
P001 | Juan | Pérez | Quito | Operador | supervisor.quito | Activo
P002 | María | García | Quito | Técnico | supervisor.quito | Activo
P003 | Carlos | López | Guayaquil | Supervisor | supervisor.guayaquil | Activo
P004 | Ana | Martínez | Guayaquil | Operador | supervisor.guayaquil | Activo
P005 | Luis | Rodríguez | Quito | Analista | supervisor.quito | Activo
```

**En la hoja "Usuarios"**, agrega:
```
supervisor.quito | demo123 | Quito | Supervisor | TRUE
supervisor.guayaquil | demo456 | Guayaquil | Supervisor | TRUE
admin.general | admin2024 | Todas | Administrador | TRUE
```

### Paso 2.4: Obtener el ID del Spreadsheet

1. Mira la URL de tu Google Sheet:
```
   https://docs.google.com/spreadsheets/d/1iRt_yrvBG1sWcSBCc-WJ27JhOHe1bsx5zXCBnOKZaRk/edit?gid=1356838793#gid=1356838793
