# Guía de Pruebas - Backend

## Estructura de Pruebas

```
__tests__/
├── setup.ts                    # Configuración global de pruebas
├── helpers/
│   └── testHelpers.ts          # Funciones auxiliares para pruebas
├── unit/                       # Pruebas unitarias
│   └── services/
│       ├── maturityCalculator.test.ts
│       └── coherenceValidator.test.ts
└── integration/                # Pruebas de integración
    ├── auth.test.ts
    ├── evaluations.test.ts
    └── maturity.test.ts
```

## Ejecutar Pruebas

### Todas las pruebas
```bash
npm test
```

### Solo pruebas unitarias
```bash
npm run test:unit
```

### Solo pruebas de integración
```bash
npm run test:integration
```

### Modo watch
```bash
npm run test:watch
```

### Con cobertura
```bash
npm run test:coverage
```

## Configuración

Las pruebas requieren:
- Base de datos PostgreSQL de prueba
- Variables de entorno configuradas en `.env.test`
- Prisma configurado con la base de datos de prueba

## Notas

- Las pruebas limpian la base de datos después de cada test
- Se crean datos de prueba temporales que se eliminan automáticamente
- Las pruebas de integración requieren que el servidor no esté corriendo en el puerto de pruebas
