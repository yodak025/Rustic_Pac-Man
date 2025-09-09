#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from maze_generation.directions import UP, RIGHT, DOWN, LEFT
from flask import Flask, jsonify, render_template, send_from_directory, request
from maze_generation.cell import create_cell_array, Cell
from maze_generation.reset import reset
from maze_generation.gen import CellConnectionsGenerator
from maze_generation.get_tiles import get_tiles
from maze_generation.is_desirable import is_desirable
from maze_generation.tunnels import TunnelsGenerator
import numpy as np
import numpy.typing as npt
import typing as t

#! Y QUE PASA SI EL PROBLEMA EN LA GENERACIÓN ES QUE NO ESTÁS RECORRIENDO LOS RANGOS COMPLETOS EN GET_TILES????
#! PARAMETROS INICIALES IGUAL VARÍAN EL RESULTADO

#? Creo que tenías razón, buen trabajo!

def ghost_home_cells(cells, cols):
    i = 3 * cols 
    x = i%cols
    y = i // cols
    c = cells[y, x]
    c.is_filled = True
    c.is_connected_at[LEFT] = c.is_connected_at[RIGHT] = c.is_connected_at[DOWN] = True

    i += 1
    x = i%cols
    y = i // cols
    c = cells[y, x]
    c.is_filled = True
    c.is_connected_at[LEFT] = c.is_connected_at[DOWN] = True

    i += cols-1
    x = i%cols
    y = i // cols
    c = cells[y, x]
    c.is_filled = True
    c.is_connected_at[RIGHT] = c.is_connected_at[UP] = c.is_connected_at[LEFT] = True

    i += 1
    x = i%cols
    y = i // cols
    c = cells[y, x]
    c.is_filled = True
    c.is_connected_at[LEFT] = c.is_connected_at[UP] = True


def set_ghost_home_door_tiles(set_tiles) -> None:
    #-- 
    set_tiles(11,2,"d")
    set_tiles(12,2,"h")
    set_tiles(13,2,"h")
    set_tiles(14,2,"h")
    set_tiles(12,3,"h")
    set_tiles(13,3,"h")
    set_tiles(14,3,"h")
    set_tiles(12,4,"h")
    set_tiles(13,4,"h")
    set_tiles(14,4,"h")



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
        self.cells: np.ndarray | None = None
        self.current_tiles: np.ndarray | None = None

    def generate_cells(self, rows, cols, max_figure_size):
        """Genera la estructura de cells únicamente"""
        self.cells = create_cell_array(rows, cols)
        def set_ghost_home(cells):
            """Establece la casa de los fantasmas en el laberinto"""
            ghost_home_cells(cells, cols)
        reset(self.cells, set_ghost_home)
        cell_connections = CellConnectionsGenerator(self.cells, max_figure_size)
        cell_connections.generate()

    def create_new_maze(self, rows, cols, max_figure_size):
        """Crea un nuevo laberinto con el número de filas y columnas especificado"""
        while True:
            print("vuelta")
            self.generate_cells(rows, cols, max_figure_size)
            if self.cells is not None and not is_desirable(self.cells):
                print("Laberinto no deseable, generando de nuevo...")
                continue
            if self.cells is not None:
                tunnels = TunnelsGenerator(self.cells)
                tunnels.generate()
                if tunnels.is_valid_cell_map:
                    print("Laberinto generado correctamente")
                    break

    def get_cells_as_json(self):
        """Convierte las celdas a un formato JSON serializable"""
        if self.cells is None:
            return []
        return cells_array_to_json(self.cells)

    def generate_tiles_from_cells(self):
        """Genera los tiles a partir de los cells actuales"""
        if self.cells is None:
            return None
        tiles = get_tiles(self.cells, set_ghost_home_door_tiles)
        self.current_tiles = np.where(tiles == '.', 0, 
                        np.where(tiles == '|', 1, 
                        np.where(tiles == '_', -2, 
                        np.where(tiles == 'h', -3,
                        np.where(tiles == 'd', -4,
                        np.where(tiles == '-', 3, 
                        -1)))))).astype(int)
        return self.current_tiles

    def get_tiles_as_json(self):
        """Convierte las celdas a un formato JSON serializable"""
        if self.current_tiles is None:
            return None
        return self.current_tiles.tolist()




maze_state = MazeState()


app = Flask(__name__, static_folder='client/dist/', template_folder='templates')

@app.route('/')
def index():
    static_folder = app.static_folder or 'client/dist/'
    return send_from_directory(static_folder, "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    static_folder = app.static_folder or 'client/dist/'
    return send_from_directory(static_folder, path)

    
@app.route('/generation-endpoint/generate-cells', methods=['POST'])
def generate_cells_endpoint():
    """Endpoint para generar únicamente la estructura de cells"""
    data = request.get_json()
    rows = data.get('rows', 10)
    cols = data.get('cols', 10)
    max_figure_size = data.get('max-figure-size', 5)
    
    maze_state.generate_cells(rows, cols, max_figure_size)
    return jsonify({"message": "Cells generated successfully", "rows": rows, "cols": cols}), 201

@app.route('/generation-endpoint/get-cells', methods=['GET'])
def get_cells_endpoint():
    """Endpoint para obtener el estado actual de los cells"""
    if maze_state.cells is None:
        return jsonify({"error": "Cells not generated yet"}), 400
    cells = maze_state.get_cells_as_json()
    return jsonify(cells)

@app.route('/generation-endpoint/generate-tiles', methods=['POST'])
def generate_tiles_endpoint():
    """Endpoint para generar tiles a partir de los cells actuales"""
    if maze_state.cells is None:
        return jsonify({"error": "Cells not generated yet"}), 400
    
    tiles = maze_state.generate_tiles_from_cells()
    if tiles is None:
        return jsonify({"error": "Failed to generate tiles"}), 500
    
    return jsonify({"message": "Tiles generated successfully"}), 201

@app.route('/generation-endpoint/get-tiles', methods=['GET'])
def get_tiles_endpoint():
    """Endpoint para obtener el tilemap actual"""
    if maze_state.current_tiles is None:
        return jsonify({"error": "Tiles not generated yet"}), 400
    tiles = maze_state.get_tiles_as_json()
    return jsonify(tiles)

@app.route('/generation-endpoint/create-maze', methods=['POST'])
def create_maze():
    """Endpoint para crear un nuevo laberinto completo (legacy)"""
    data = request.get_json()
    rows = data.get('rows', 10)
    cols = data.get('cols', 10)
    max_figure_size = data.get('max-figure-size', 5)
    
    maze_state.create_new_maze(rows, cols, max_figure_size)
    maze_state.generate_tiles_from_cells()
    return jsonify({"message": "Maze created successfully", "rows": rows, "cols": cols}), 201


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
