from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from lexer import Lexer
from parser import Parser
from turing_machine import TuringMachine

app = Flask(__name__)
CORS(app)

# Información del estudiante
STUDENT_INFO = {
    "Nombre": "Dominguez Ruiz Ruli Emanuel",
    "Materia": "Lenguaje Autómatas I",
    "Horario": "15:00 - 16:00"
}

@app.route('/')
def index():
    return render_template('index.html', student=STUDENT_INFO)

@app.route('/analyze/lexer', methods=['POST'])
def analyze_lexer():
    data = request.json
    if not data or 'code' not in data:
        return jsonify({"error": "No se proporcionó código"}), 400
    
    code = data['code']
    lexer = Lexer()
    tokens, errores_lexicos = lexer.tokenize(code)
    
    return jsonify({
        "tokens": tokens,
        "errors": errores_lexicos
    })

@app.route('/analyze/parser', methods=['POST'])
def analyze_parser():
    data = request.json
    if not data or 'code' not in data:
        return jsonify({"error": "No se proporcionó código"}), 400
    
    code = data['code']
    parser = Parser()
    ast, errores_sintacticos = parser.parse(code)
    
    return jsonify({
        "ast": ast,
        "errors": errores_sintacticos
    })

@app.route('/analyze/turing', methods=['POST'])
def analyze_turing():
    data = request.json
    if not data or 'input' not in data:
        return jsonify({"error": "No se proporcionó entrada para la Máquina de Turing"}), 400
    
    entrada = data['input']
    turing = TuringMachine()
    resultado = turing.procesar_entrada(entrada)
    
    return jsonify(resultado)

if __name__ == '__main__':
    app.run(debug=True)

