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
-html : Get the code blocks from an html document.
-ar: Adds '%%%%' delimiter between code blocks.
-h : Show this help page.

```

To use labels in code blocks and them rendering properly you need:
* [pagedown](https://github.com/ujifgc/pagedown).
* [pagedown-extra](https://github.com/jmcmanus/pagedown-extra), the `fenced_code_gfm` extension.
