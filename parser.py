import ply.yacc as yacc
from lexer import Lexer
from typing import List, Dict, Any, Tuple, Optional

class Parser:
    def __init__(self):
        self.lexer = Lexer()
        self.tokens = self.lexer.tokens
        self.parser = yacc.yacc(module=self)
        self.errors: List[Dict[str, Any]] = []
        
    def parse(self, text: str) -> Tuple[Optional[Dict], List[Dict]]:
        self.errors = []
        try:
            result = self.parser.parse(text)
            return result, self.errors
        except Exception as e:
            self.errors.append({
                'tipo': 'Error de Sintaxis',
                'mensaje': str(e),
                'linea': 0,
                'posicion': 0
            })
            return None, self.errors

    # Definición de precedencia de operadores
    precedence = (
        ('left', 'SUMA', 'RESTA'),
        ('left', 'MULTIPLICACION', 'DIVISION'),
    )

    # Reglas de producción
    def p_statement(self, p):
        '''
        statement : asignacion
                 | expresion
        '''
        p[0] = {'tipo': 'sentencia', 'valor': p[1]}

    def p_asignacion(self, p):
        '''
        asignacion : IDENTIFICADOR ASIGNACION expresion
        '''
        p[0] = {
            'tipo': 'asignacion',
            'variable': p[1],
            'valor': p[3]
        }

    def p_expresion_binop(self, p):
        '''
        expresion : expresion SUMA expresion
                 | expresion RESTA expresion
                 | expresion MULTIPLICACION expresion
                 | expresion DIVISION expresion
        '''
        p[0] = {
            'tipo': 'operacion_binaria',
            'operador': p[2],
            'izquierda': p[1],
            'derecha': p[3]
        }

    def p_expresion_group(self, p):
        '''
        expresion : PARENTESIS_IZQ expresion PARENTESIS_DER
        '''
        p[0] = {
            'tipo': 'grupo',
            'expresion': p[2]
        }

    def p_expresion_numero(self, p):
        '''
        expresion : NUMERO
        '''
        p[0] = {
            'tipo': 'numero',
            'valor': p[1]
        }

    def p_expresion_cadena(self, p):
        '''
        expresion : CADENA
        '''
        p[0] = {
            'tipo': 'cadena',
            'valor': p[1]
        }

    def p_expresion_id(self, p):
        '''
        expresion : IDENTIFICADOR
        '''
        p[0] = {
            'tipo': 'variable',
            'nombre': p[1]
        }

    def p_error(self, p):
        if p:
            error_msg = f"Error de sintaxis en el token '{p.value}'"
            linea = p.lineno if hasattr(p, 'lineno') else 0
            posicion = p.lexpos if hasattr(p, 'lexpos') else 0
        else:
            error_msg = "Error de sintaxis al final del archivo"
            linea = 0
            posicion = 0
            
        self.errors.append({
            'tipo': 'Error de Sintaxis',
            'mensaje': error_msg,
            'linea': linea,
            'posicion': posicion
        })
