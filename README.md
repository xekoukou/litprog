# litprog

A literate programming tool. Check the litprog.md file for documentation.

## Installation

```
npm install -g litprog
```

## Help


```
litprog -h
```
```
litprog source_path label
This program defaults at getting the code blocks with the specified label from a single Markdown file.

Options
-html : Get the code blocks from an html document(from tags with class 'markdown').
-ar: Adds '%%%%' delimiter between code blocks.
-h : Show this help page.

```

### Examples

This will get all the code blocks labeled javascript and will write them to the litprog.js file.

```
litprog litprog.md javascript > litprog.js
```


To use labels in code blocks and them rendering properly you need:
* [pagedown](https://github.com/ujifgc/pagedown).
* [pagedown-extra](https://github.com/jmcmanus/pagedown-extra), the `fenced_code_gfm` extension.
