## Ideas for possible improvements for milsymbol

### GENERAL
* favor maintainability over time/performance over space/memory
* reduce overall complexity (1,827 branches, 28,534 statements)
* consistently apply ES6 style throughout the code
* replace deprecated String.substr()
* replace == and != with === and !==
* use immutable objects whenever appropriate (incl. Symbol)
* never modify actual parameters
* remove/replace all var declarations
* favor map/reduce over loops
* reduce (global) symbol state as far as possible

### SPECIFIC
* drop Canvas2D support (for now)
* define icon parts statically, preferably in JSON definition files
* defer styling as long as possible
* add named styles to icon parts depending on symbol options
* use expression framework for dynamic texts
* use SVG compliant attributes throughout the code
* hoist default style attributes to SVG namespace
* define icons (composition of icon parts) declaratively (NICE TO HAVE)
* introduce SVG group to scale/transform icon parts
* improve separation of symbol style options and effective style
* remove icon cache
* move SIDC-dependent metadata to JSON configuration (NICE TO HAVE)
* abstract styling over letter and number SIDC (alpha/numeric)
* fail fast (on invalid SIDCs), expose Error class to extensions
* define and expose interface/pipeline for symbol parts and composition
* use expression framework for text modifiers/amplifiers

### CANCELLED
* IMPRACTICAL - use XML library to generate SVG from JavaScript object
* OVER-ENGINEERED - use simple layout framework for placement/alignment
