# Comments
The best commenting method is readable code. However, sometimes it is helpful to understand some parts of the code and a good project needs to be consistent, no mather of the different languages.

All the comments of this project need to be written in english. Pay attention to any typo and fix it if necesary.

## Python:
All functions and classes are mainly commented with an explicit type definition and docstrings. Classes can have 2-6 lines while a function should be 2-3 if it is big, important or specially rare and 1 if it is a private small functionality.

the "#" comments are allowed for rare parts of the code. If it refers to a section it should be at te beggining of the previous line.  If it refers to a line of code, try to adjust it at the end of that line in order to mantain the code structure. 

## TypeScript:
All functions and classes are mainly commented with explicit type definitions and JSDoc comments. Classes can have 2-6 lines while a function should be 2-3 if it is big, important or specially rare and 1 if it is a private small functionality.

The "//" comments are allowed for rare parts of the code. If it refers to a section it should be at the beginning of the previous line. If it refers to a line of code, try to adjust it at the end of that line in order to maintain the code structure.

Multi-line comments "/* */" should be used sparingly, mainly for temporarily disabling code blocks during development and the JSDoc comments.

## Developer
In order to be consistent, I define myself a simple code tag convention to tag the comments. It is usefull for seeking 
- \[TODO]: Some task that needs to be done in the future. Generic, all purpose tag.
- \[BUG]: Something in the code that actually causes an error.
- \[LAZY ANY]: Some variable not typed for no valid reason.
- \[SHIT CODE]: Some code that is not buggy but it is problematic.
- \[CLEARING]: Unused code that requires some kind of decision or a full perspective of the actual scope to be erase
- \[HARD CODED]: Used to indicate magic numbers or other kind of literal definitions inside the code.
- \[QUARENTINE]: Code that it's suspicious but has major reasons to still. 

## Flavors
- ? For Doubt 
- ! For Enphasis 
- ~ For saying "it is here but the actual decision is to ignore it"