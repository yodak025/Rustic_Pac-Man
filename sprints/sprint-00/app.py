#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
from pathlib import Path
import json

from flask import Flask, jsonify, render_template, send_from_directory, request
from maze_generation.cell import create_cell_array, Cell
from maze_generation.reset import reset
from maze_generation.gen import CellConnectionsGenerator
from maze_generation.get_tiles import get_tiles
from maze_generation.testing_tiles import parse_tiles
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


app = Flask(__name__, static_folder='pacman-r3f/dist/', template_folder='templates')

@app.route('/')
def index():
    """Página principal con la interfaz"""
    return render_template('index.html')

@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

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
    
    
@app.route('/generation-endpoint/create-maze', methods=['POST'])
def create_maze():
    """Endpoint para crear un nuevo laberinto"""
    data = request.get_json()
    rows = data.get('rows', 10)
    cols = data.get('cols', 10)
    max_figure_size = data.get('max-figure-size', 5)
    
    maze_state.create_new_maze(rows, cols, max_figure_size)
    return jsonify({"message": "Maze created successfully", "rows": rows, "cols": cols}), 201

@app.route('/generation-endpoint/get-tiles', methods=['GET'])
def get_tiles_endpoint():
    """Endpoint para obtener las celdas del laberinto en formato JSON"""
    if maze_state.cells is None:
        return jsonify({"error": "Maze not created yet"}), 400
    tiles = maze_state.get_tiles_as_json()
    return jsonify(tiles)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5005)
