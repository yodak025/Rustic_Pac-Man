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

#! Y QUE PASA SIEL PROBLEMA EN LA GENERACIÓN ES QUE NO ESTÁS RECORRIENDO LOS RANGOS COMPLETOS EN GET_TILES????
#! PARAMETROS INICIALES IGUAL VARÍAN EL RESULTADO

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



class MazeState: 
    def __init__(self):
        self.cells: np.ndarray | None = None

    def create_new_maze(self, rows, cols, max_figure_size):
        """Crea un nuevo laberinto con el número de filas y columnas especificado"""
        while True:
            print("vuelta")
            self.cells = create_cell_array(rows, cols)
            def set_ghost_home(cells):
                """Establece la casa de los fantasmas en el laberinto"""
                ghost_home_cells(cells, cols)
            reset(self.cells, set_ghost_home)
            cell_connections = CellConnectionsGenerator(self.cells, max_figure_size)
            cell_connections.generate()
            if not is_desirable(self.cells):
                print("Laberinto no deseable, generando de nuevo...")
                continue
            tunnels = TunnelsGenerator(self.cells)
            tunnels.generate()
            if tunnels.is_valid_cell_map:
                print("Laberinto generado correctamente")
                break



    def get_tiles_as_json(self):
        """Convierte las celdas a un formato JSON serializable"""
        tiles = get_tiles(self.cells, set_ghost_home_door_tiles)
        numeric_tiles = np.where(tiles == '.', 0, 
                        np.where(tiles == '|', 1, 
                        np.where(tiles == '_', -2, 
                        np.where(tiles == 'h', -3,
                        np.where(tiles == 'd', -4,
                        np.where(tiles == '-', 3, 
                        -1)))))).astype(int)
        
        return numeric_tiles.tolist()




maze_state = MazeState()


app = Flask(__name__, static_folder='client/dist/', template_folder='templates')

@app.route('/')
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(app.static_folder, path)

    
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
    app.run(debug=True, host='0.0.0.0', port=5000)
