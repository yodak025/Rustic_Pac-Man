# Generación Procedural de Laberintos Tipo Pac-Man: Aproximación Teórica

## Resumen

Este documento describe el enfoque teórico y metodológico empleado en el desarrollo de un sistema de generación procedural de laberintos inspirado en el diseño clásico de Pac-Man. El algoritmo implementado se basa en el trabajo de Shaun LeBron sobre generación automática de laberintos para Pac-Man, adaptándolo y extendiéndolo para producir estructuras jugables que respetan las convenciones estéticas y funcionales del título original de Namco.

La generación procedural en videojuegos busca crear contenido de forma automática mediante algoritmos, permitiendo variabilidad y rejugabilidad sin necesidad de diseño manual exhaustivo. En el caso de Pac-Man, esto presenta desafíos únicos debido a las estrictas restricciones geométricas y de jugabilidad que caracterizan a sus laberintos.

---

## 1. Contexto y Motivación

### 1.1 Características de los Laberintos de Pac-Man

Los laberintos del Pac-Man original no son estructuras arbitrarias, sino que siguen un conjunto de principios de diseño cuidadosamente balanceados:

1. **Simetría**: Los niveles presentan simetría bilateral vertical, reduciendo la complejidad visual y facilitando la memorización espacial por parte del jugador.

2. **Conectividad completa**: No existen callejones sin salida (dead-ends). Todo camino forma parte de un circuito cerrado, permitiendo al jugador escapar siempre de situaciones de persecución.

3. **Geometría restringida**: Los muros siguen patrones específicos:
   - Caminos de un único tile de anchura
   - Sin giros bruscos de 90 grados consecutivos
   - Formas de muro limitadas a configuraciones I, L, T o cruz (+)
   - Muros no rectangulares con grosor mínimo de 2 tiles

4. **Túneles laterales**: Pasajes en los bordes que permiten teletransportarse al lado opuesto del laberinto, añadiendo una dimensión táctica al juego.

5. **Casa de fantasmas**: Zona central delimitada donde residen inicialmente los enemigos, con acceso restringido para el jugador.

Estas restricciones convierten la generación procedural de laberintos tipo Pac-Man en un problema de optimización con múltiples restricciones, donde no basta con crear un grafo conexo, sino que debe cumplir criterios estéticos y funcionales específicos.

### 1.2 Desafíos de la Generación Procedural

Los enfoques tradicionales de generación de laberintos (búsqueda en profundidad, algoritmo de Prim, división recursiva) no son directamente aplicables aquí por varias razones:

- **Simetría bilateral**: Requiere generar solo la mitad del laberinto y reflejarlo.
- **Ausencia de callejones sin salida**: Algoritmos como DFS naturalmente generan dead-ends.
- **Control sobre formas de muros**: Los algoritmos clásicos no garantizan patrones geométricos específicos.
- **Grosor de muros variable**: La distinción entre muros de 1 y 2 tiles según su forma no es trivial de implementar.

Por tanto, se hace necesario un enfoque especializado que aborde estas particularidades desde su concepción algorítmica.

---

## 2. Fundamentos del Algoritmo Basado en Figuras

### 2.1 Concepto de Figura

El algoritmo propuesto se fundamenta en el concepto de **figura** como unidad compositiva básica. Una figura es un grupo de celdas conectadas que, en su conjunto, definen una región estructural del laberinto. Estas figuras no representan directamente los muros visibles, sino que actúan como **plantillas abstractas** cuyas relaciones espaciales determinan dónde se generarán los caminos transitables.

La intuición clave es la siguiente: si dos celdas adyacentes pertenecen a figuras diferentes, la frontera entre ellas se convertirá en un camino transitable en el laberinto final. Por el contrario, si ambas pertenecen a la misma figura, formarán parte de un mismo bloque de muros.

Este enfoque permite:
- Control directo sobre la topología del laberinto mediante la agrupación de celdas.
- Garantizar ciertas propiedades geométricas al restringir el tamaño y forma de las figuras.
- Facilitar la simetría al operar solo sobre la mitad del espacio y reflejar el resultado.

### 2.2 Representación Espacial

El espacio de generación se modela como una **cuadrícula bidimensional de celdas**. Cada celda representa una región del laberinto y contiene:

- **Identificadores posicionales**: Coordenadas (x, y) dentro de la cuadrícula.
- **Estado de llenado**: Indica si la celda ya ha sido asignada a una figura.
- **Conectividad direccional**: Registro de conexiones con celdas adyacentes en las cuatro direcciones cardinales (arriba, derecha, abajo, izquierda).
- **Identificador de grupo**: Número de secuencia de la figura a la que pertenece.
- **Referencias a vecinos**: Punteros o referencias a celdas adyacentes para navegación eficiente.

La cuadrícula inicial representa **solo la mitad derecha del laberinto**. El resultado final se obtiene por reflexión simétrica, duplicando y espejando esta mitad a lo largo del eje vertical central.

### 2.3 Proceso de Generación en Múltiples Etapas

El algoritmo se estructura en un pipeline de cinco etapas claramente diferenciadas:

1. **Inicialización**: Creación y enlazado de la estructura de celdas.
2. **Generación de conectividad**: Construcción del grafo de figuras mediante algoritmo incremental.
3. **Validación de deseabilidad**: Verificación de restricciones geométricas y corrección de anomalías.
4. **Generación de túneles**: Identificación y apertura de pasajes en los bordes laterales.
5. **Conversión a tilemap**: Expansión y traducción del grafo abstracto a representación visual concreta.

Cada etapa consume el resultado de la anterior y puede provocar el reinicio completo del proceso si detecta una configuración inválida. Este enfoque de **generate-and-test** es común en sistemas procedurales con restricciones complejas.

---

## 3. Etapa 1: Generación de Conectividad Mediante Figuras

### 3.1 Algoritmo de Crecimiento Incremental

El núcleo del sistema es un algoritmo de construcción incremental que recorre la cuadrícula **columna por columna, de izquierda a derecha**, asignando celdas vacías a nuevas figuras. El proceso para cada figura sigue este patrón:

#### Inicialización de figura
1. Se selecciona una celda vacía de la columna más a la izquierda que contenga celdas sin asignar.
2. Esta celda se designa como **celda inicial** y **celda central** de la nueva figura.
3. Se marca como llena y se le asigna un identificador de grupo único.

#### Crecimiento iterativo
1. Desde la celda central, se evalúan las direcciones en las que la figura puede crecer.
2. Una dirección es válida si:
   - Existe una celda adyacente en esa dirección que esté vacía.
   - La celda a la izquierda de esa celda adyacente está llena (o no existe).
   - Esta restricción garantiza que la figura solo crece hacia regiones "apoyadas" en material ya generado, evitando formas flotantes o discontinuas.
3. Se elige una dirección válida aleatoriamente y se conectan ambas celdas bidireccionalmente.
4. La nueva celda se marca como llena y se añade al grupo de la figura.
5. El proceso se repite hasta que:
   - No quedan direcciones válidas de crecimiento.
   - Un criterio probabilístico decide detener el crecimiento (las figuras grandes tienen menor probabilidad de seguir creciendo).

#### Patrones especiales
Para evitar monotonía y replicar formas características de Pac-Man, se introducen dos patrones especiales:

- **Figuras en L**: Cuando una figura alcanza tamaño 2 (dos celdas horizontales consecutivas), existe una probabilidad de extenderla con una tercera celda perpendicular, formando una L.
  
- **Piernas largas** (long legs): Figuras de tamaño 3-4 pueden extender una celda adicional desde su perímetro para crear protuberancias.

#### Recentrado dinámico
Si durante el crecimiento la celda central se queda sin vecinos válidos, el algoritmo intenta **cambiar el punto de referencia** a la celda más recientemente añadida. Esto permite a las figuras "doblar" su dirección de crecimiento sin quedar bloqueadas prematuramente.

### 3.2 Control de Variabilidad

La generación está gobernada por varios parámetros probabilísticos:

- **Tamaño máximo de figura**: Límite superior al número de celdas que puede contener una figura (típicamente 5).
- **Probabilidades de crecimiento por tamaño**: A medida que una figura crece, disminuye la probabilidad de que continúe creciendo, favoreciendo figuras pequeñas y medianas.
- **Probabilidades de extensión especial**: Controlan la frecuencia de aparición de formas L y piernas largas.
- **Límite de piernas largas**: Restringe cuántas protuberancias extendidas pueden aparecer en el laberinto.

Estos parámetros permiten ajustar el "estilo" del laberinto generado: más compacto o más abierto, más rectilíneo o más irregular.

### 3.3 Tratamiento de Bordes

Las celdas en la columna del extremo derecho reciben tratamiento especial:
- No participan en el algoritmo de figuras estándar.
- Se conectan automáticamente hacia la derecha (hacia el borde).
- Esta conexión prepara el terreno para la generación posterior de túneles.

Las celdas en las filas superior e inferior pueden conectarse aleatoriamente hacia arriba/abajo con cierta probabilidad, creando variedad en los bordes del laberinto.

### 3.4 Resultado de Esta Etapa

Al finalizar, todas las celdas están asignadas a figuras. El resultado es un **grafo de conectividad** donde:
- Cada celda conoce a qué figura pertenece.
- Cada celda sabe con cuáles de sus vecinos está conectada.
- Este grafo codifica implícitamente la estructura de caminos del laberinto: las fronteras entre figuras se convertirán en pasillos transitables.

---

## 4. Etapa 2: Validación de Deseabilidad

### 4.1 Restricciones Geométricas

No todas las configuraciones de figuras generadas son válidas. Esta etapa verifica dos condiciones críticas:

#### Condición 1: Esquinas del borde
Las celdas en las esquinas superior-derecha e inferior-derecha del espacio no deben tener conexiones que las saquen del área del laberinto (hacia arriba, abajo o hacia la derecha). Tales conexiones crearían inconsistencias al reflejar simétricamente la mitad generada.

#### Condición 2: Bloques 2×2
Se detectan configuraciones donde cuatro celdas forman un cuadrado 2×2 perteneciendo cada una a una figura diferente sin conexiones internas. Esta situación es problemática porque:
- Al reflejarse en el eje de simetría (si el bloque está en la columna izquierda), generaría un bloque 3×2 asimétrico.
- Visualmente crea muros "gruesos" que no siguen los patrones estéticos de Pac-Man.

Cuando se detecta un bloque 2×2:
- Si está en la columna del eje de simetría (columna 0), la configuración se rechaza completamente.
- Si está en otras columnas, se "fusiona" conectando internamente las cuatro celdas y asignándolas al mismo grupo.

### 4.2 Estrategia de Regeneración

Si alguna condición falla, se descarta toda la configuración generada y se reinicia el proceso desde la Etapa 1 con nueva semilla aleatoria. Este enfoque de **rechazo y regeneración** es simple pero efectivo cuando la tasa de éxito es razonablemente alta (típicamente 20-50% en los primeros intentos).

---

## 5. Etapa 3: Generación de Túneles

### 5.1 Concepto de Túnel

Los túneles son pasajes en los bordes izquierdo y derecho del laberinto que permiten al jugador aparecer en el lado opuesto, creando un efecto de teletransportación horizontal. Son elementos clave del gameplay de Pac-Man, proporcionando rutas de escape estratégicas.

### 5.2 Identificación de Candidatos

El algoritmo analiza la **columna del extremo derecho** buscando posiciones apropiadas para colocar un túnel. Se clasifican tres tipos de candidatos según su calidad:

#### Túneles vacíos (void tunnels) - Prioridad alta
Celdas que ya están conectadas hacia la derecha y cuyo vecino superior también lo está. Estas posiciones ofrecen "huecos" naturales donde un túnel puede abrirse limpiamente sin interferir con estructuras de muros.

#### Túneles de callejón sin salida (dead-end tunnels) - Prioridad media
Celdas aisladas (no conectadas hacia la derecha) con vecinos superiores o inferiores conectados. Abrir un túnel aquí convierte un potencial callejón ciego en un pasaje útil.

Se subdividen en:
- **Simple**: Solo uno de los vecinos (superior o inferior) está conectado.
- **Doble**: Ambos vecinos están conectados, creando un corredor vertical junto al túnel.

#### Túneles de borde (edge tunnels) - Prioridad baja
Cualquier celda del borde que no cumpla criterios anteriores pero esté en posición aceptable (no demasiado cerca de esquinas). Se usan como último recurso si no hay mejores opciones.

### 5.3 Selección y Validación

1. Se elige aleatoriamente un candidato de la categoría de mayor prioridad disponible.
2. Se marca esa celda como punto de salida del túnel.
3. Se valida que el túnel no intersecta con caminos verticales que lo cortarían visualmente:
   - Se recorre horizontalmente desde la celda del túnel hacia la izquierda.
   - Si se encuentra una conexión vertical (arriba/abajo) en la misma fila, el túnel es inválido.
4. Si la validación falla, se rechaza toda la configuración y se reinicia desde Etapa 1.

### 5.4 Limpieza de Callejones Residuales

Tras colocar túneles, pueden quedar callejones sin salida indeseados. El algoritmo identifica estas situaciones y conecta las celdas problemáticas con sus vecinos superiores, integrándolas en el flujo de circulación del laberinto.

---

## 6. Etapa 4: Expansión a Tilemap

### 6.1 Del Grafo Abstracto a la Representación Visual

Hasta este punto, el laberinto existe como un grafo abstracto de celdas y conexiones. La etapa de expansión lo transforma en una **matriz de tiles** donde cada celda se representa con múltiples tiles visuales, permitiendo renderizar muros de diferente grosor y formas complejas.

### 6.2 Proceso de Expansión

#### Expansión 3×3
Cada celda del grafo se expande a una región de 3×3 tiles en el tilemap final. Este factor de expansión permite:
- Diferenciar entre caminos (1 tile de ancho) y muros (2+ tiles de grosor).
- Representar las conexiones entre celdas como corredores explícitos.
- Añadir detalles visuales (esquinas, intersecciones) sin ambigüedad.

#### Generación de caminos
Se recorre el tilemap expandido y se marcan como **camino transitable** (`.`) los tiles donde:
- Existe un cambio de figura (dos celdas adyacentes con diferente `group_seq`).
- Existe una conexión explícita entre celdas de la misma figura.
- Se cruzan caminos diagonales que necesitan "rellenar" esquinas.

#### Generación de muros
Tras colocar todos los caminos, se recorre nuevamente el tilemap y se marcan como **muro** (`|`) todos los tiles adyacentes (ortogonalmente o diagonalmente) a un camino. Esto garantiza que los caminos estén bordeados por muros visibles.

#### Aplicación de simetría
El tilemap generado representa solo la mitad derecha del laberinto. Se duplica y refleja horizontalmente para crear la mitad izquierda, obteniendo un laberinto completo simétrico.

### 6.3 Procesamiento de Túneles en el Tilemap

Las celdas marcadas como salidas de túnel se traducen en tiles de camino en el borde del tilemap. Se realiza una limpieza adicional:
- Se detectan caminos "colgantes" en los bordes que no son túneles válidos.
- Se eliminan retrocediendo hasta encontrar una intersección, evitando caminos sin sentido en los bordes.

### 6.4 Colocación de Elementos de Juego

#### Power pellets
Se colocan aleatoriamente **dos power pellets** (items especiales que permiten al jugador comerse a los fantasmas) con distribución estratégica:
- Uno en la mitad superior del laberinto.
- Uno en la mitad inferior.
- Se buscan posiciones en tiles de camino mediante muestreo aleatorio con límite de intentos.

Esto garantiza distribución espacial equilibrada y evita agrupación excesiva de power pellets.

#### Casa de fantasmas (Echoes Chamber)
Se crea manualmente una zona rectangular en una posición predefinida del laberinto (típicamente en el centro vertical). Esta zona:
- Está delimitada por muros especiales.
- Tiene una puerta de acceso restringido.
- Contiene tiles especiales que identifican la zona como "prohibida" para el jugador.

La creación manual permite garantizar dimensiones y conectividad específicas que serían difíciles de conseguir proceduralmente.

### 6.5 Codificación Numérica

El tilemap se representa finalmente como una matriz de enteros donde cada número identifica un tipo de tile:
- **0**: Camino con pac-dot (punto coleccionable normal).
- **1**: Muro.
- **2**: Power pellet.
- **-2**: Vacío (no utilizado en gameplay).
- **-3**: Zona de casa de fantasmas.
- **-4**: Puerta de casa de fantasmas.

Esta codificación facilita la interpretación por parte del motor de juego y permite extensiones futuras añadiendo nuevos códigos.

---

## 7. Propiedades Emergentes y Garantías del Algoritmo

### 7.1 Conectividad Completa

El algoritmo garantiza que **no existen callejones sin salida** en el laberinto generado debido a:
1. La generación figura por figura asegura que las celdas se agrupan en bloques conectados.
2. La conversión a caminos en fronteras de figuras crea una red de pasillos interconectados.
3. La limpieza post-túnel elimina cualquier dead-end residual.

Esta propiedad es verificable mediante análisis de conectividad del grafo resultante.

### 7.2 Restricciones Geométricas

Las restricciones sobre formas de muros se satisfacen por construcción:
- **Caminos de 1 tile**: La expansión 3×3 y la regla de marcar fronteras de figuras produce naturalmente caminos estrechos.
- **Sin giros bruscos**: La restricción de crecimiento de figuras (no crecer en direcciones opuestas consecutivas) previene ángulos agudos.
- **Muros de grosor controlado**: La expansión y el marcado de muros adyacentes produce muros de 2+ tiles automáticamente.

### 7.3 Variabilidad y Repetibilidad

El sistema ofrece:
- **Alta variabilidad**: La aleatoriedad en la selección de celdas iniciales, direcciones de crecimiento y aplicación de patrones especiales genera laberintos únicos en cada ejecución.
- **Reproducibilidad**: Al usar generadores pseudoaleatorios con semilla, se puede regenerar exactamente el mismo laberinto proporcionando la misma semilla inicial.

Esta dualidad es esencial para testing, depuración y compartición de niveles específicos.

---

## 8. Análisis de Complejidad y Rendimiento

### 8.1 Complejidad Temporal

Para un laberinto de dimensiones R×C (filas × columnas):

- **Generación de figuras**: O(R × C), ya que cada celda se visita una vez.
- **Validación**: O(R × C), recorrido lineal de la cuadrícula.
- **Generación de túneles**: O(R), solo se analiza una columna.
- **Expansión a tilemap**: O(R × C × k²), donde k=3 es el factor de expansión.

**Complejidad total**: O(R × C) en el caso promedio por intento.

Sin embargo, el modelo generate-and-test introduce un factor de **número de intentos** que depende de la tasa de éxito de validación. Empíricamente, con parámetros bien ajustados, converge en 1-5 intentos (95% de los casos).

### 8.2 Complejidad Espacial

- **Cuadrícula de celdas**: O(R × C) en memoria para almacenar el grafo de celdas.
- **Tilemap final**: O((R × k) × (C × k)) = O(R × C) con constante mayor.

El uso de memoria es lineal respecto al tamaño del laberinto, permitiendo generar laberintos de tamaños significativos sin problemas de escalabilidad.

### 8.3 Consideraciones de Rendimiento

En la práctica, laberintos de tamaño estándar (9 filas × 5 columnas, expandiendo a ~29×32 tiles) se generan en **milisegundos** en hardware moderno. El cuello de botella principal no es el algoritmo en sí, sino:
- La inicialización del entorno de ejecución (especialmente en contextos como Pyodide en navegador).
- La serialización y transferencia del tilemap generado al motor de juego.

---

## 9. Limitaciones y Extensiones Futuras

### 9.1 Limitaciones Actuales

#### Dependencia de parámetros
El algoritmo requiere ajuste cuidadoso de parámetros probabilísticos. Valores inadecuados pueden resultar en:
- Tasas de convergencia muy bajas (muchos intentos fallidos).
- Laberintos demasiado abiertos o demasiado cerrados.
- Escasez de patrones especiales (Ls, piernas largas).

#### Elementos no procedurales
Actualmente, la casa de fantasmas y su ubicación están codificadas manualmente. Esto reduce la variabilidad y requiere ajustes manuales al cambiar dimensiones del laberinto.

#### Generación de un solo túnel
El sistema genera únicamente un túnel lateral. Los laberintos clásicos de Pac-Man suelen tener dos túneles (uno superior y uno inferior), aumentando las opciones tácticas.

### 9.2 Extensiones Posibles

#### Parametrización completa
Exponer todos los parámetros internos como argumentos de entrada permitiría:
- Ajuste fino sin modificar código.
- Creación de "perfiles" de generación (laberintos densos, laberintos abiertos, etc.).
- Optimización automatizada mediante algoritmos genéticos o búsqueda de hiperparámetros.

#### Casa de fantasmas procedural
Generar la casa de fantasmas algorítmicamente permitiría:
- Variar su posición (arriba, centro, abajo).
- Alterar su tamaño y forma.
- Crear múltiples cámaras o configuraciones alternativas.

#### Multi-túnel
Implementar generación de dos o más túneles requiere:
- Distribución espacial inteligente (evitar túneles demasiado cercanos).
- Validación de que ambos túneles son viables simultáneamente.
- Ajuste de candidatos para garantizar al menos N túneles válidos.

#### Colocación inteligente de power pellets
En lugar de colocación aleatoria, aplicar heurísticas basadas en:
- Distancia máxima entre power pellets.
- Proximidad a zonas de alta complejidad topológica.
- Análisis de "peligrosidad" (cercanía a casa de fantasmas).

#### Generación asimétrica
Relajar la restricción de simetría permitiría mayor variedad, aunque sacrificando parte de la estética clásica de Pac-Man. Requeriría adaptar todo el pipeline para operar sobre el laberinto completo.

#### Validación semántica avanzada
Analizar propiedades de gameplay más profundas:
- Longitud mínima/máxima de caminos críticos.
- Densidad de intersecciones (afecta dificultad de persecución).
- "Puntos calientes" donde el jugador es más vulnerable.
- Balance de zonas abiertas vs. estrechas.

---

## 10. Conclusiones

El sistema de generación procedural de laberintos tipo Pac-Man presentado combina técnicas clásicas de generación con restricciones específicas de dominio para producir niveles jugables y estéticamente coherentes. Los puntos clave del enfoque son:

1. **Abstracción mediante figuras**: La representación abstracta de regiones estructurales mediante figuras permite control fino sobre la topología del laberinto sin trabajar directamente con muros y caminos.

2. **Pipeline multi-etapa**: La separación en fases (conectividad, validación, túneles, expansión) facilita el razonamiento sobre cada aspecto del problema y permite optimizaciones independientes.

3. **Generate-and-test**: El modelo de regeneración ante fallos es simple y efectivo para problemas con restricciones complejas, aunque puede mejorarse con técnicas de backtracking más sofisticadas.

4. **Fidelidad al diseño original**: Las restricciones geométricas y funcionales del Pac-Man original se respetan, produciendo laberintos que "se sienten" auténticos.

5. **Extensibilidad**: El diseño modular permite incorporar mejoras futuras sin reescribir el núcleo del algoritmo.

Este trabajo demuestra que la generación procedural en contextos altamente restringidos es viable mediante la combinación de:
- Algoritmos especializados que explotan la estructura del problema.
- Validación incremental para detectar fallos temprano.
- Balanceo entre determinismo (garantías) y aleatoriedad (variabilidad).

La aplicación de estos principios es transferible a otros problemas de generación procedural en videojuegos donde existen restricciones estrictas de diseño, como generación de puzzles, plataformas 2D, o niveles de estrategia por turnos.

---

## Referencias

**LeBron, Shaun.** "Pac-Man Maze Generator". *Proyecto personal de investigación en generación procedural*, 2018. Disponible en: https://shaunlebron.github.io/pacman-mazegen/

**Namco.** *Pac-Man*. Videojuego arcade, 1980. Diseño de niveles: Toru Iwatani.

**Shaker, Noor; Togelius, Julian; Nelson, Mark J.** *Procedural Content Generation in Games: A Textbook and an Overview of Current Research*. Springer, 2016.

**Smith, Gillian; Whitehead, Jim.** "Analyzing the Expressive Range of a Level Generator". *Proceedings of the 2010 Workshop on Procedural Content Generation in Games*, 2010.
