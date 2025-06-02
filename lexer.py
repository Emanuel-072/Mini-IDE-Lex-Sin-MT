import ply.lex as lex
from typing import List, Dict, Any

class Lexer:
    # Lista de nombres de tokens en español
    tokens = [
        'NUMERO',
        'SUMA',
        'RESTA',
        'MULTIPLICACION',
        'DIVISION',
        'PARENTESIS_IZQ',
        'PARENTESIS_DER',
        'IDENTIFICADOR',
        'ASIGNACION',
        'CADENA',
    ]

    # Reglas simples para tokens
    t_SUMA = r'\+'
    t_RESTA = r'-'
    t_MULTIPLICACION = r'\*'
    t_DIVISION = r'/'
    t_PARENTESIS_IZQ = r'\('
    t_PARENTESIS_DER = r'\)'
    t_ASIGNACION = r'='

    # Lista para almacenar errores léxicos
    errors: List[Dict[str, Any]] = []
    
    def __init__(self):
        """Inicializa el analizador léxico"""
        self.lexer = lex.lex(module=self)
        self.errors = []
        self.lineas = []
        self.posiciones_linea = []

    def calcular_posicion_linea_columna(self, posicion: int) -> tuple[int, int]:
        """
        Calcula la línea y columna para una posición dada en el texto
        
        Args:
            posicion (int): Posición en el texto
            
        Returns:
            tuple: (línea, columna)
        """
        linea = 1
        columna = 0
        for i, char in enumerate(self.texto_entrada):
            if i == posicion:
                break
            if char == '\n':
                linea += 1
                columna = 0
            else:
                columna += 1
        return linea, columna

    def t_NUMERO(self, t):
        r'\d+'
        t.value = int(t.value)
        return t

    def t_CADENA(self, t):
        r'\"([^\\\n]|(\\.))*?\"'
        return t

    def t_IDENTIFICADOR(self, t):
        r'[a-zA-ZáéíóúÁÉÍÓÚñÑ_][a-zA-ZáéíóúÁÉÍÓÚñÑ_0-9]*'
        return t

    def t_newline(self, t):
        r'\n+'
        t.lexer.lineno += len(t.value)

    # Caracteres ignorados
    t_ignore = ' \t'

    def t_error(self, t):
        """Manejo de errores léxicos"""
        linea, columna = self.calcular_posicion_linea_columna(t.lexpos)
        error_info = {
            'tipo': 'Error Léxico',
            'valor': t.value[0],
            'linea': linea,
            'columna': columna,
            'posicion': t.lexpos,
            'mensaje': f'Carácter ilegal "{t.value[0]}" en línea {linea}, columna {columna}'
        }
        self.errors.append(error_info)
        t.lexer.skip(1)

    def tokenize(self, data: str) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Analiza el texto de entrada y retorna los tokens y errores encontrados
        
        Args:
            data (str): Texto a analizar
            
        Returns:
            tuple: (lista de tokens, lista de errores)
        """
        self.errors = []
        self.texto_entrada = data
        self.lexer.input(data)
        tokens = []
        
        while True:
            tok = self.lexer.token()
            if not tok:
                break
            
            linea, columna = self.calcular_posicion_linea_columna(tok.lexpos)
            tokens.append({
                'tipo': tok.type,
                'valor': tok.value,
                'linea': linea,
                'columna': columna,
                'posicion': tok.lexpos
            })
            
        return tokens, self.errors

# Ejemplo de uso
if __name__ == '__main__':
    lexer = Lexer()
    test_input = 'x = 42 + y * "test"'
    tokens, errors = lexer.tokenize(test_input)
    
    print("Tokens encontrados:")
    for token in tokens:
        print(token)
        
    print("\nErrores encontrados:")
    for error in errors:
        print(error)
