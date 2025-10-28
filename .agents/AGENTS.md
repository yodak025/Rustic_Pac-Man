# Rustic Pacman
## Project context
This project is a browser videogame. Is a pacman clone inspired by the generation concept of Spelunky. You can find some information about the concept in the file [README.md](README.md) 

## Development principles
1. Follow the KISS priciple. The code should be as simple as posible.
2. Try to apply SOLID principles when posible, taking care of avoiding too complex implementations.
3. My prompts could be either in english, espanish or even a mix of those two. The code should be always writen in english. That includes the comments, if you find some spanish translate or delete it. 
4. Use the Clean Code precepts. Specially, pay attention to the idea of reducing the use of comments to the miminum. Use descriptive names to make the code easier to understand. We consider unnecesary all the comments that doesn't bring more information to the code. If you find some comments that explain something self explained in the lecture of the program, erase them. Particulary, the typical args-return descriptions in the functions/methods are completelly forbiden.
5. Use explicit typing in both .py and .ts/.tsx files. However, if there's an interface definition, dont replicate the typing on the implementation.
6. I want you to be as prudent as posible. Try to make as less modifications as possible to achieve my requests. If my prompts are too poor, do not write code. Instead, respond me to make the details more clear. 

## Folder paths 
The code of the project is inside the `/src` folder. Some of the most relevant areas paths are:
- the main game logical engine: `/src/core`
- the python maze generator: `/src/maze-gen`
- the react three fiber scene and components: `/src/scenes`
- the zustand state, divided in differents stores: `/src/state`
- the react layouts and components used in the app: `/src/ui`
- the types used in all the project: `/src/types` 

## TODO

**Model risk**: if a requested change touches secrets, prod infra, or critical tests — prefer to produce a proposal PR rather than an immediate change.