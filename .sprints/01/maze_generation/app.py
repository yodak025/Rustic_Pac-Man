#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
from pathlib import Path
import json

# Añadir el directorio maze_generation al path
project_root = Path(__file__).resolve().parent.parent
maze_gen_path = project_root / "maze_generation"
sys.path.insert(0, str(maze_gen_path))

from flask import Flask, jsonify, render_template, request
from cell import create_cell_array, Cell
from reset import reset
from gen import CellConnectionsGenerator
from get_tiles import get_tiles
from testing_tiles import parse_tiles
import numpy as np

def cell_to_dict(cell: Cell) -> dict:
    """Convierte un objeto Cell a un diccionario serializable"""
    return {
        'id': cell.id,
        'x': cell.x,
        'y': cell.y,
        'is_filled': cell.is_filled,
        'seq': cell.seq,
        'group_seq': cell.group_seq,
        'is_connected_at': cell.is_connected_at,
        'is_raise_height_candidate': cell.is_raise_height_candidate,
        'is_shrink_width_candidate': cell.is_shrink_width_candidate
    }

def cells_array_to_json(cells_array):
    """Convierte el array de células a JSON"""
    rows, cols = cells_array.shape
    result = []
    
    for i in range(rows):
        row = []
        for j in range(cols):
            cell = cells_array[i, j]
            row.append(cell_to_dict(cell))
        result.append(row)
    
    return result

class MazeState: 
    def __init__(self):
        self.cells = None

    def get_cells_as_json(self):
        """Convierte las celdas a un formato JSON serializable"""
        if self.cells is None:
            return []
        return cells_array_to_json(self.cells)
    def create_new_maze(self, rows, cols, max_figure_size):
        """Crea un nuevo laberinto con el número de filas y columnas especificado"""
        self.cells = create_cell_array(rows, cols)
        reset(self.cells)
        generator = CellConnectionsGenerator(self.cells, max_figure_size)
        generator.generate()

    def get_tiles_as_json(self):
        """Convierte las celdas a un formato JSON serializable"""
        tiles = get_tiles(self.cells)
        numeric_tiles = np.where(tiles == '.', 0, 
                        np.where(tiles == '|', 1, 
                        np.where(tiles == '_', -1, 
                        -1))).astype(int)
        return numeric_tiles.tolist()




maze_state = MazeState()


app = Flask(__name__, static_folder='rustic-client', template_folder='templates')

@app.route('/')
def index():
    """Página principal con la interfaz"""
    return render_template('index.html')

@app.route('/generate-cells', methods=['POST'])
def generate_cells():
    """Endpoint para generar las celdas"""
    try:
        # Obtener parámetros del request (con valores por defecto)
        data = request.get_json() if request.is_json else {}
        rows = data.get('rows', 8)
        cols = data.get('cols', 8)
        max_figure_size = data.get('max_figure_size', 5)
        
        maze_state.create_new_maze(rows, cols, max_figure_size)
        cells_json = maze_state.get_cells_as_json()
        
        return jsonify({
            'success': True,
            'cells': cells_json,
            'rows': rows,
            'cols': cols
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
@app.route('/rustic-client/generate-maze')
def generate_maze():
    return maze_state.get_tiles_as_json()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5005)
