from typing import List, Dict, Any, Tuple

class TuringMachine:
    def __init__(self):
        # Configuración inicial de la máquina
        self.cinta: List[str] = []
        self.posicion_cabezal: int = 0
        self.estado_actual: str = 'q0'
        self.blank_symbol = '□'  # Símbolo para espacio en blanco
        
        # Definir estados
        self.estados = {'q0', 'q1', 'q2', 'qaceptar', 'qrechazar'}
        self.estado_inicial = 'q0'
        self.estados_aceptacion = {'qaceptar'}
        self.estados_rechazo = {'qrechazar'}
        
        # Función de transición (estado_actual, símbolo_actual) -> (nuevo_estado, nuevo_símbolo, movimiento)
        self.transiciones = {
            # Estado inicial: verifica que comience con 1
            ('q0', '1'): ('q1', '1', 'R'),
            ('q0', '0'): ('qrechazar', '0', 'R'),  # Rechaza si comienza con 0
            
            # Estado q1: busca un 0 moviéndose a la derecha
            ('q1', '1'): ('q1', '1', 'R'),  # Sigue buscando
            ('q1', '0'): ('qaceptar', '0', 'R'),  # Encontró un 0, acepta
            ('q1', '□'): ('qrechazar', '□', 'R'),  # Llegó al final sin encontrar 0
        }

    def inicializar_cinta(self, entrada: str) -> None:
        """Inicializa la cinta con la entrada proporcionada"""
        self.cinta = list(entrada)
        self.cinta.append(self.blank_symbol)
        self.posicion_cabezal = 0
        self.estado_actual = self.estado_inicial

    def obtener_simbolo_actual(self) -> str:
        """Obtiene el símbolo en la posición actual del cabezal"""
        if 0 <= self.posicion_cabezal < len(self.cinta):
            return self.cinta[self.posicion_cabezal]
        return self.blank_symbol

    def mover_cabezal(self, direccion: str) -> None:
        """Mueve el cabezal en la dirección especificada"""
        if direccion == 'R':
            self.posicion_cabezal += 1
            if self.posicion_cabezal >= len(self.cinta):
                self.cinta.append(self.blank_symbol)
        elif direccion == 'L':
            self.posicion_cabezal = max(0, self.posicion_cabezal - 1)

    def paso(self) -> Dict[str, Any]:
        """Ejecuta un paso de la máquina y retorna el estado actual"""
        simbolo_actual = self.obtener_simbolo_actual()
        transicion = self.transiciones.get((self.estado_actual, simbolo_actual))

        if not transicion:
            self.estado_actual = 'qrechazar'
        else:
            nuevo_estado, nuevo_simbolo, movimiento = transicion
            self.cinta[self.posicion_cabezal] = nuevo_simbolo
            self.estado_actual = nuevo_estado
            self.mover_cabezal(movimiento)

        return {
            'cinta': ''.join(self.cinta),
            'posicion_cabezal': self.posicion_cabezal,
            'estado': self.estado_actual,
            'aceptado': self.estado_actual in self.estados_aceptacion,
            'rechazado': self.estado_actual in self.estados_rechazo,
            'terminado': self.estado_actual in self.estados_aceptacion | self.estados_rechazo
        }

    def ejecutar(self, entrada: str, max_pasos: int = 100) -> List[Dict[str, Any]]:
        """Ejecuta la máquina de Turing y retorna el historial de estados"""
        self.inicializar_cinta(entrada)
        historial = []
        
        for _ in range(max_pasos):
            estado_actual = self.paso()
            historial.append(estado_actual)
            
            if estado_actual['terminado']:
                break
                
        return historial

    def validar_entrada(self, entrada: str) -> bool:
        """Valida que la entrada solo contenga símbolos válidos"""
        return all(c in {'0', '1'} for c in entrada)

    def procesar_entrada(self, entrada: str) -> Dict[str, Any]:
        """Procesa una entrada y retorna el resultado con mensajes en español"""
        if not self.validar_entrada(entrada):
            return {
                'error': 'La entrada solo puede contener los símbolos 0 y 1',
                'valida': False
            }

        historial = self.ejecutar(entrada)
        ultimo_estado = historial[-1]

        resultado = {
            'historial': historial,
            'valida': ultimo_estado['aceptado'],
            'mensaje': 'Cadena aceptada' if ultimo_estado['aceptado'] else 'Cadena rechazada',
            'pasos_totales': len(historial),
            'descripcion': 'Esta máquina acepta cadenas que comienzan con 1 y contienen al menos un 0'
        }

        return resultado
