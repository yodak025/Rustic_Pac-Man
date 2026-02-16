#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Configuration schema and validation for giant maze generation.
Provides validation for maze generation parameters.
"""
import logging
from typing import Dict, Any, Optional


LOGGER = logging.getLogger("config-schema")


class MazeConfig:
    """
    Configuration class for giant maze generation.
    Encapsulates all parameters needed for maze generation with validation.
    """
    def __init__(self, config_dict: Optional[Dict[str, Any]] = None):
        """
        Initialize configuration from dictionary or use defaults.
        
        Args:
            config_dict: Optional configuration dictionary. If None, uses defaults.
        """
        config = config_dict or {}
        
        # Dimensions
        dimensions = config.get('dimensions', {})
        self.layer_rows: int = dimensions.get('layer_rows', 36)
        self.layer_cols: int = dimensions.get('layer_cols', 5)
        self.num_layers: int = dimensions.get('num_layers', 4)
        
        # Tunnels
        tunnels = config.get('tunnels', {})
        self.entry_position: Optional[int] = tunnels.get('entry_position', None)
        self.exit_position: Optional[int] = tunnels.get('exit_position', None)
        
        # Entities
        entities = config.get('entities', {})
        self.ghost_ratio: int = entities.get('ghost_ratio', 100)  # 1 ghost per 100 pacdots
        self.powerpellet_ratio: int = entities.get('powerpellet_ratio', 60)  # 1 powerpellet per 60 pacdots
        
        # Chunking
        chunking = config.get('chunking', {})
        self.min_chunk_size: int = chunking.get('min_chunk_size', 5)
        self.max_chunks_per_layer: int = chunking.get('max_chunks_per_layer', 3)
        
        # Generation parameters
        self.max_figure_size: int = config.get('max_figure_size', 5)
        self.seed: Optional[int] = config.get('seed', None)
        
        # Validate configuration
        self._validate()
        
    def _validate(self):
        """Validates configuration parameters and raises ValueError if invalid."""
        if self.layer_rows < 9:
            raise ValueError(f"layer_rows must be >= 9, got {self.layer_rows}")
        if self.layer_cols < 5:
            raise ValueError(f"layer_cols must be >= 5, got {self.layer_cols}")
        if self.num_layers < 1:
            raise ValueError(f"num_layers must be >= 1, got {self.num_layers}")
        if self.min_chunk_size < 5:
            raise ValueError(f"min_chunk_size must be >= 5, got {self.min_chunk_size}")
        if self.min_chunk_size > self.layer_rows:
            raise ValueError(f"min_chunk_size ({self.min_chunk_size}) cannot exceed layer_rows ({self.layer_rows})")
        if self.max_chunks_per_layer < 1:
            raise ValueError(f"max_chunks_per_layer must be >= 1, got {self.max_chunks_per_layer}")
        if self.max_chunks_per_layer > 3:
            raise ValueError(f"max_chunks_per_layer must be <= 3, got {self.max_chunks_per_layer}")
        if self.ghost_ratio < 1:
            raise ValueError(f"ghost_ratio must be >= 1, got {self.ghost_ratio}")
        if self.powerpellet_ratio < 1:
            raise ValueError(f"powerpellet_ratio must be >= 1, got {self.powerpellet_ratio}")
        
        # Validate tunnel positions if provided
        if self.entry_position is not None:
            if self.entry_position < 0 or self.entry_position >= self.layer_rows:
                raise ValueError(f"entry_position must be in range [0, {self.layer_rows}), got {self.entry_position}")
        if self.exit_position is not None:
            if self.exit_position < 0 or self.exit_position >= self.layer_rows:
                raise ValueError(f"exit_position must be in range [0, {self.layer_rows}), got {self.exit_position}")
        
        LOGGER.debug(f"Configuration validated successfully: {self}")
    
    def __repr__(self):
        """String representation for debugging."""
        return (f"MazeConfig(dimensions={self.layer_rows}x{self.layer_cols}, "
                f"layers={self.num_layers}, "
                f"chunks={self.min_chunk_size}-{self.max_chunks_per_layer}, "
                f"ratios=ghost:{self.ghost_ratio}/pp:{self.powerpellet_ratio})")
    
    def to_dict(self) -> Dict[str, Any]:
        """Converts configuration back to dictionary format."""
        return {
            'dimensions': {
                'layer_rows': self.layer_rows,
                'layer_cols': self.layer_cols,
                'num_layers': self.num_layers
            },
            'tunnels': {
                'entry_position': self.entry_position,
                'exit_position': self.exit_position
            },
            'entities': {
                'ghost_ratio': self.ghost_ratio,
                'powerpellet_ratio': self.powerpellet_ratio
            },
            'chunking': {
                'min_chunk_size': self.min_chunk_size,
                'max_chunks_per_layer': self.max_chunks_per_layer
            },
            'max_figure_size': self.max_figure_size,
            'seed': self.seed
        }
