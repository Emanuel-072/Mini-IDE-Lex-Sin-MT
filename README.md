# Mini IDE - Analizador Léxico, Sintáctico y Máquina de Turing 🚀
[![Python](https://img.shields.io/badge/python-v3.7+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/flask-v2.0+-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

<div align="center">

Un IDE interactivo que implementa análisis léxico, sintáctico y una máquina de Turing para validar cadenas a^n b^n.

[Características](#características) •
[Instalación](#instalación) •
[Uso](#uso) •
[Documentación](#documentación)

</div>

---

## 👨‍💻 Información del Proyecto

- **Estudiante:** Dominguez Ruiz Ruli Emanuel
- **Materia:** Lenguajes y Autómatas I
- **Horario:** 15:00 - 16:00
- **Carrera:** ISC
- **Docente:** Molina Gomez Kevin David

## 🚀 Características Principales

- ✨ Editor de código con resaltado de sintaxis
- 🔍 Análisis léxico y sintáctico en tiempo real
- 🤖 Máquina de Turing para validación de cadenas
- 📝 Interfaz intuitiva y amigable

## 🛠️ Instalación

### Requisitos Previos

- Python 3.7 o superior
- Flask (framework web)
- Navegador web moderno

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd mini_ide

# Instalar dependencias
pip install -r requirements.txt
```

## 💻 Uso

1. Iniciar el servidor:
   ```bash
   python app.py
   ```
2. Abrir el navegador en `http://localhost:5000`

## 📚 Documentación

### Lenguaje Personalizado

#### Tokens Soportados

| Token | Descripción | Ejemplo |
|-------|-------------|---------|
| ID | Identificador | variable, contador |
| NUM | Número entero | 42, 100 |
| PLUS | Operador suma | + |
| MINUS | Operador resta | - |
| TIMES | Operador multiplicación | * |
| DIVIDE | Operador división | / |
| ASSIGN | Operador asignación | = |
| LPAREN | Paréntesis izquierdo | ( |
| RPAREN | Paréntesis derecho | ) |
| SEMICOLON | Punto y coma | ; |

#### Gramática

```bnf
programa    → declaración*
declaración → asignación | expresión
asignación → ID ASSIGN expresión SEMICOLON
expresión   → término ((PLUS|MINUS) término)*
término     → factor ((TIMES|DIVIDE) factor)*
factor      → NUM | ID | LPAREN expresión RPAREN
```

### 🤖 Máquina de Turing (a^n b^n)

La máquina implementada valida cadenas con igual número de 'a's seguidas de igual número de 'b's.

#### Ejemplos Válidos
- ✅ `ab` (n=1)
- ✅ `aabb` (n=2)
- ✅ `aaabbb` (n=3)
- ✅ `aaaabbbb` (n=4)

#### Ejemplos Inválidos
- ❌ `a` (falta b)
- ❌ `b` (falta a)
- ❌ `ba` (orden incorrecto)
- ❌ `aab` (número desigual)
- ❌ `abb` (número desigual)

### 📝 Ejemplos de Código

#### Expresiones Válidas
```python
x = 42;
resultado = (a + b) * 2;
suma = valor1 + valor2;
```

#### Expresiones Inválidas
```python
x = ;           // Falta expresión
y = (a + b;     // Falta paréntesis
2 + * 3;        // Operadores mal utilizados
```

## 🔍 Características del IDE

### Editor de Código
- 📊 Numeración de líneas
- 🚫 Resaltado de errores
- 🔄 Autoindentación

### Análisis Léxico
- 🔍 Identificación de tokens
- ⚠️ Detección de errores léxicos
- 📋 Reporte detallado de tokens

### Análisis Sintáctico
- ✅ Validación de expresiones
- ❌ Detección de errores sintácticos
- 🌳 Árbol sintáctico para expresiones válidas

### Máquina de Turing
- 📼 Visualización de la cinta
- 📝 Historial de pasos
- 📖 Explicación detallada del proceso
- ✨ Validación de cadenas a^n b^n

## 🤝 Contribución

Este proyecto fue desarrollado como parte del curso de Lenguajes y Autómatas I. Si encuentras algún error o tienes sugerencias de mejora, por favor crea un issue en el repositorio.

---

<div align="center">
Desarrollado por Ruli Emanuel Dominguez Ruiz
</div>